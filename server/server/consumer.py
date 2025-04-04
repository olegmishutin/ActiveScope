import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer


class SignalConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']

        if self.user is None:
            return await self.close()

        self.room_group_name = f'signal_for_{self.user.id}'

        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )
        await self.accept()

    async def disconnect(self, code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )

    async def message(self, event):
        message = event.get('message')

        if message is not None:
            await self.send_json(message)

    @classmethod
    async def encode_json(cls, content):
        return json.dumps(content, ensure_ascii=False)
