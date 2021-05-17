import logging
import json

import sys

from caprotobackend.util import rest_request_handler, require_authentication

from caproto.threading.client import Context
import caproto


async def config_web_app(app, settings):
    pv_data_source = PVDataSource()

    app.router.add_route('GET', '/pvapi/pv/read/{pv_name}', pv_data_source.read_pv)
    app.router.add_route('POST', '/pvapi/pv/write/{pv_name}', pv_data_source.write_pv)
    app.router.add_route('POST', '/pvapi/pv/read', pv_data_source.read_pvs)


class PVDataSource:
    def __init__(self):
        self.ctx = Context(timeout=5)

    @rest_request_handler
    @require_authentication(permission='Read')
    async def read_pvs(self, request):
        post_data = await request.json()
        # strip non-ascii characters
        jso_str = json.dumps(post_data)
        jso_str = jso_str.encode('ascii', errors='ignore').decode()
        pv_names = json.loads(jso_str)

        pvs = self.ctx.get_pvs(*pv_names)
        data_list = []

        for pv in pvs:
            data = self.pv_to_data(pv)
            data_list.append(data)

        return data_list

    @rest_request_handler
    @require_authentication(permission='Read')
    async def read_pv(self, request):
        pv_name = request.match_info.get('pv_name')
        pv = self.ctx.get_pvs(pv_name)[0]
        data = self.pv_to_data(pv)
        return data

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
        enum_post_data = post_data
        control_pv = pv.read(data_type='control')
        if 'ENUM' in control_pv.pv_value.data_type.name:
            enum_post_data = []
            for val in post_data:
                if isinstance(val, int):
                    enum_post_data.append(val)
                else:
                    enum_val = control_pv.metadata.enum_strings.index(val.encode())
                    enum_post_data.append(enum_val)

        result = pv.write(enum_post_data, wait=False)

        if result.status.success == 1:
            data = self.pv_to_data(pv)
            return {
                'status': 'success',
                'message': 'PV value updated',
                'data': data,
            }
        else:
            return {
                'status': 'fail',
                'message': result.status.description,
            }

    def pv_to_data(self, pv):
        if not pv.connected:
            return {
                'name': pv.name
            }
        pv_value = pv.read(data_type='time')
        data_type = pv_value.data_type.name
        meta_data = pv_value.metadata
        data_list = []
        timestamp = 0
        if 'ENUM' in data_type:
            timestamp = meta_data.timestamp * 1000
            control_pv = pv.read(data_type='control')
            for data in pv_value.data:
                enum_val = control_pv.metadata.enum_strings[data]
                if type(enum_val) is bytes:
                    data_list.append(enum_val.decode("utf-8"))
                else:
                    data_list.append(enum_val)
        else:
            timestamp = meta_data.stamp.as_datetime().timestamp() * 1000
            for data in pv_value.data:
                if type(data) is bytes:
                    data_list.append(data.decode("utf-8"))
                else:
                    data_list = pv_value.data.tolist()
                    break

        return {
            'data_type': pv_value.data_type.name,
            'time_stamp': timestamp,
            'alarm_status': caproto.AlarmStatus(meta_data.status).name,
            'alarm_severity': caproto.AlarmSeverity(meta_data.severity).name,
            'data': data_list,
            'name': pv.name
        }
