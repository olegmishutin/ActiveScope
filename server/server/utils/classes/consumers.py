import json

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from asgiref.sync import sync_to_async


class MessangerConsumer(AsyncJsonWebsocketConsumer):
    parent_model = None
    message_simple_serializer = None
    parent_serializer_name = ''
    url_route_identifier_name = None
    room_name_with_formating = ''

    async def connect(self):
        self.user = self.scope['user']

        if self.user is None:
            return await self.close()

        parent_id = self.scope['url_route']['kwargs'][self.url_route_identifier_name]
        try:
            self.parent_instance = await self.parent_model.objects.aget(id=parent_id)
        except self.parent_model.DoesNotExist:
            return await self.close()

        is_member = await self.parent_instance.members.filter(id=self.user.id).aexists()
        if not is_member:
            return await self.close()

        self.room_group_name = self.room_name_with_formating.format(parent_id)

        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )
        await self.accept()

    async def disconnect(self, code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )

    async def receive_json(self, content, **kwargs):
        if content.get('object') is not None:
            serializer = self.message_simple_serializer(
                data=content['object'], context={
                    'user': self.user,
                    self.parent_serializer_name: self.parent_instance.id
                }
            )
            serializer_is_valid = await sync_to_async(serializer.is_valid)()

            if serializer_is_valid:
                saved = await sync_to_async(serializer.save)()
                serialized_data = await sync_to_async(lambda: self.message_simple_serializer(saved).data)()

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
