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

  data: Map<string, any> = new Map();

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.resolution = instanceSettings.jsonData.resolution || 1000.0;
    this.apiKey = instanceSettings.jsonData.apiKey || '';
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const promises = options.targets.map((query) =>
      this.doRequest(query).then((response) => {
        const frame = new MutableDataFrame({
          refId: query['pv_name'],
          fields: [
            { name: 'Time', type: FieldType.time },
            { name: 'Value', type: FieldType.number },
            { name: 'alarm_status', type: FieldType.string },
            { name: 'alarm_severity', type: FieldType.string },
          ],
        });

        let response_data = response['data'];
        if (response_data) {
          let pv_name: string = query['pv_name']!;
          let query_data = this.data.get(pv_name);
          if (query_data == null) {
            query_data = [];
          }

          query_data.push(response_data);
          this.data.set(pv_name, query_data);

          query_data.forEach((point: any) => {
            frame.appendRow([
              new Date(point['time_stamp']),
              point['data'][0],
              point['alarm_status'],
              point['alarm_severity'],
            ]);
          });
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
