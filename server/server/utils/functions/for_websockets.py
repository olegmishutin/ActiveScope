from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def get_message(content, method=None, type='message'):
    message = {
        'type': 'message',
        'message': {
            'object': content
        }
    }

    if method is not None:
        message['message']['method'] = method
    return message


def send_signal_to_socket(signal_from, user_id, extend_message=None):
    content = {'signal_from': signal_from}

    if extend_message is not None:
        content.update(extend_message)

    async_to_sync(get_channel_layer().group_send)(
        f'signal_for_{user_id}', get_message(content)
    )
