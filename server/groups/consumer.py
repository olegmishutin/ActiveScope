import json

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from asgiref.sync import sync_to_async

from .models import GroupMessanger
from .serializers import GroupMessangerMessageSimpleSerializer


class GroupMessangerConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']

        if self.user is None:
            await self.close()

        messanger_id = self.scope['url_route']['kwargs']['messanger_id']
        try:
            self.messanger = await GroupMessanger.objects.aget(id=messanger_id)
        except GroupMessanger.DoesNotExist:
            await self.close()

        is_member = await self.messanger.members.filter(id=self.user.id).aexists()
        if not is_member:
            await self.close()

        self.room_group_name = f'group_messanger_{messanger_id}'

        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )

    async def receive_json(self, content, **kwargs):
        if content.get('method') is not None and content.get('object') is not None:
            serializer = GroupMessangerMessageSimpleSerializer(
                data=content['object'], context={
                    'user': self.user,
                    'messanger': self.messanger
                }
            )
            serializer_is_valid = await sync_to_async(serializer.is_valid)()

            if serializer_is_valid:
                saved = await sync_to_async(serializer.save)()
                serialized_data = await sync_to_async(lambda: GroupMessangerMessageSimpleSerializer(saved).data)()

                await  self.channel_layer.group_send(
                    self.room_group_name, {
                        'type': 'message',
                        'message': {
                            'method': 'create',
                            'object': serialized_data
                        }
                    }
                )

    async def message(self, event):
        message = event.get('message')

        if message is not None:
            await self.send_json(message)

    @classmethod
    async def encode_json(cls, content):
        return json.dumps(content, ensure_ascii=False)