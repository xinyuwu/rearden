from aiohttp import web, ClientTimeout, ClientSession
import datetime
import functools
import json
import logging
import jwt

SECRET_KEY = '1sCETvywO1oinJa3u78HUGafyMHRbaHnExhhqFN06JZwta0u3Qb8DwRKsU5Arsa'


def json_encode(obj):
    if isinstance(obj, datetime.datetime):
        return obj.timestamp()


json_response = functools.partial(web.json_response, dumps=functools.partial(json.dumps, default=json_encode))


def rest_request_handler(func):
    logging.info('request_handler')
    """Decorator for REST request handlers.

    The request handler should return an object that is able to be json encoded, rather than a Response. This decorator
    will create the response for you. Unhandled exceptions with result in a Response with status 500, and the error as
    the body.
    """
    @functools.wraps(func)
    async def rest_request_handler_inner(*args):
        try:
            result = await func(*args)
        except Exception as e:
            logging.exception('Unhandled error:')
            return web.Response(status=500, text=str(e), reason='Internal server error: {}'.format(e))
        else:
            return json_response(result)

    return rest_request_handler_inner


def require_authentication(permission):

    def actual_authenticate(func):
        @functools.wraps(func)
        async def authenticate(*args):
            try:
                request = args[1]
                token_passed = request.headers['TOKEN']
                token_info = jwt.decode(token_passed, SECRET_KEY, algorithms=['HS256'])
            except Exception as e:
                logging.exception('Unhandled error:')
                return {"message": "Invalid token: " + str(e)}

            try:
                if token_info:
                    expire_time_str = token_info.get('expire')
                    if expire_time_str:
                        time_sec = int(expire_time_str) / 1000
                        expire_time = datetime.datetime.fromtimestamp(time_sec)
                        if expire_time < datetime.datetime.utcnow():
                            return {"message": "Token expired"}

                    if (token_info.get('permission') == 'read' or token_info.get('permission') == 'write') \
                            and permission == 'Read':
                        return await func(*args)

                    if permission == 'Write' and token_info.get('permission') == 'write':
                        return await func(*args)
            except Exception as e:
                raise e

            return {"message": "Permission denied"}

        return authenticate

    return actual_authenticate


async def fetch(session, url, timeout_total=20, params={}, headers={}, is_result_json=True):
    timeout = ClientTimeout(total=timeout_total)
    async with session.get(url, timeout=timeout, params=params, headers=headers) as response:
        if response.status == 200:
            text = await response.content.read()
            if is_result_json:
                return json.loads(text)
            else:
                return text
        else:
            text = await response.content.read()
            raise Exception(text)
