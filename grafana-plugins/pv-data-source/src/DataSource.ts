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

export class XinyuDataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  resolution: number;
  apiKey = '';

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.resolution = instanceSettings.jsonData.resolution || 1000.0;
    this.apiKey = instanceSettings.jsonData.apiKey || '';
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const timeStamp = new Date();
    const promises = options.targets.map((query) =>
      this.doRequest(query).then((response) => {
        const frame = new MutableDataFrame({
          refId: query['pv_name'],
          fields: [
            { name: 'Time', type: FieldType.time },
            { name: 'Value_Time', type: FieldType.time },
            { name: 'Value', type: FieldType.number },
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
      url: 'http://localhost:8080/pvapi/pv/write/' + pvName,
      data: value,
      headers: { TOKEN: this.apiKey },
    });

    return result;
  }

  async doRequest(query: MyQuery) {
    console.log('doRequest ' + query['pv_name']);

    if (query['pv_name'] === '') {
      return {};
    }

    const result = await getBackendSrv().datasourceRequest({
      method: 'GET',
      url: 'http://localhost:8080/pvapi/pv/read/' + query['pv_name'],
      params: query,
      headers: { TOKEN: this.apiKey },
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
