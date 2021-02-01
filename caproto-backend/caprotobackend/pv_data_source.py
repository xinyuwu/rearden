import logging
import json

from caprotobackend.util import rest_request_handler, require_authentication

from caproto.threading.client import Context
import caproto


async def config_web_app(app, settings):
    pv_data_source = PVDataSource()

    app.router.add_route('GET', '/pvapi/pv/read/{pv_name}', pv_data_source.read_pv)
    app.router.add_route('POST', '/pvapi/pv/write/{pv_name}', pv_data_source.write_pv)


class PVDataSource:
    def __init__(self):
        self.ctx = Context()

    @rest_request_handler
    @require_authentication(permission='Read')
    async def read_pv(self, request):
        pv_name = request.match_info.get('pv_name')
        pv = self.ctx.get_pvs(pv_name)[0]
        pv_value = pv.read(data_type='time')
        meta_data = pv_value.metadata
        return {
            'data_type': pv_value.data_type.name,
            'time_stamp': meta_data.stamp.as_datetime().timestamp() * 1000,
            'alarm_status': caproto.AlarmStatus(meta_data.status).name,
            'alarm_severity': caproto.AlarmSeverity(meta_data.severity).name,
            'data': pv_value.data.tolist(),
        }

    @rest_request_handler
    @require_authentication(permission='Write')
    async def write_pv(self, request):
        pv_name = request.match_info.get('pv_name')

        post_data = await request.json()
        # strip non-ascii characters
        jso_str = json.dumps(post_data)
        jso_str = jso_str.encode('ascii', errors='ignore').decode()
        post_data = json.loads(jso_str)

        pv = self.ctx.get_pvs(pv_name)[0]
        result = pv.write(post_data)

        if result.status.success == 1:
            pv_value = pv.read(data_type='time')
            meta_data = pv_value.metadata
            return {
                'status': 'success',
                'message': 'PV value updated',
                'data_type': pv_value.data_type.name,
                'time_stamp': meta_data.stamp.as_datetime().timestamp() * 1000,
                'alarm_status': caproto.AlarmStatus(meta_data.status).name,
                'alarm_severity': caproto.AlarmSeverity(meta_data.severity).name,
                'data': pv_value.data.tolist(),
            }
        else:
            return {
                'status': 'fail',
                'message': result.status.description,
            }
