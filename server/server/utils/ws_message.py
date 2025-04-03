def get_message(method, content, type='message'):
    return {
        'type': 'message',
        'message': {
            'method': method,
            'object': content
        }
    }
