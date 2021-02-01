import asyncio
import sys
import aiohttp.web
import uvloop

import contextlib

from aiohttp import web

from pv_data_source import config_web_app 
import logging

def main():
    try:
        asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())
        loop = asyncio.get_event_loop()
        settings = None
        app = loop.run_until_complete(make_web_app(settings))
        web_app = {"port": 7654}
        aiohttp.web.run_app(app, **web_app)
    except Exception as e:
        logging.exception('Unhandled exception: %s', e)
        sys.exit(3)


async def make_web_app(settings, loop=None):
    app = web.Application(loop=loop)
    app['settings'] = settings

    app['objects_stack'] = contextlib.ExitStack()
    app.on_shutdown.append(shutdown_app)

    await config_web_app(app, settings)

    app.router.add_route('GET', '/', home)
    app.router.add_route('GET', '/pvapi/', home)
    app.router.add_route('OPTIONS', '/{remaining:.*}', options)

    return app


async def shutdown_app(app):
    app['objects_stack'].__exit__(None, None, None)


async def acao_on_prepare(host, request, response):
    response.headers['Access-Control-Allow-Origin'] = host
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS, DELETE'
    response.headers['Access-Control-Allow-Headers'] = 'content-type,accept'
    response.headers['Access-Control-Max-Age'] = '1728000'


async def home(request):
    return web.HTTPFound(location='/api/doc')


async def options(request):
    return web.Response()


if __name__ == "__main__":
    main()
