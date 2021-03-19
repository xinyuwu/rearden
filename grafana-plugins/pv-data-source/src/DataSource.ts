import { getBackendSrv } from '@grafana/runtime';

import {
  DataQueryRequest,
  DataSourceApi,
  DataQueryResponse,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions } from './types';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  path = '';

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.path = '/api/datasources/proxy/' + this.id;
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const timeStamp = new Date();
    const promises = options.targets.map((query) =>
      this.doRequest(query).then((response) => {
        const frame = new MutableDataFrame({
          name: query['pv_name'],
          refId: query['refId'],
          fields: [
            { name: 'Time', type: FieldType.time },
            { name: 'Value_Time', type: FieldType.time },
            { name: 'Value', type: FieldType.other },
            { name: 'alarm_status', type: FieldType.string },
            { name: 'alarm_severity', type: FieldType.string },
          ],
        });

        let response_data = response['data'];
        if (response_data) {
          response_data['time'] = timeStamp;
          frame.appendRow([
            timeStamp,
            new Date(response_data['time_stamp']),
            response_data['data'][0],
            response_data['alarm_status'],
            response_data['alarm_severity'],
          ]);
        }

        return frame;
      })
    );

    return Promise.all(promises).then((data) => ({ data }));
  }

  async doWrite(pvName: string, value: number[]) {
    console.log('doRequest');
    const result = await getBackendSrv().datasourceRequest({
      method: 'POST',
      url: this.path + 'write/' + pvName,
      data: value,
      headers: { TOKEN: '' },
    });

    // headers: { TOKEN: this.apiKey },
    return result;
  }

  async doRequest(query: MyQuery) {
    console.log('doRequest ' + query['pv_name']);

    if (query['pv_name'] === '') {
      return {};
    }

    const result = await getBackendSrv().datasourceRequest({
      method: 'GET',
      url: this.path + '/read/' + query['pv_name'],
      params: query,
    });

    return result;
  }

  async testDatasource() {
    // Implement a health check for your data source.
    return {
      status: 'success',
      message: 'Success',
    };
  }
}
