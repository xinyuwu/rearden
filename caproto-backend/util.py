from aiohttp import web, ClientTimeout, ClientSession
import datetime
import functools
import json
import logging


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


def require_authentication(mode):
    logging.info('authenticate')
    def actual_authenticate(func):
        @functools.wraps(func)
        async def authenticate(*args):
            try:
                request = args[1]
                token = request.headers['Authorization']
                headers = {"Authorization": token}
                async with ClientSession() as session:
                    result = await fetch(session=session, url='http://nginx:8080/api/auth/keys', headers=headers)
                    if type(result) is not list:
                        return {"message": result.get('message')}

                    user_info = result[0]
                    if user_info:
                        if mode=='Read':
                            return await func(*args)

                        if mode=='Write' and user_info['role']!='Viewer':
                            return await func(*args)

            except Exception as e:
                logging.exception('Unhandled error:')
                return {"message": "Permission denied " + str(e)}

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
