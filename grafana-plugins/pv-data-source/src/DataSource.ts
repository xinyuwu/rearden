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

  data: any[] = [];

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.resolution = instanceSettings.jsonData.resolution || 1000.0;
    this.apiKey = instanceSettings.jsonData.apiKey || '';
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const promises = options.targets.map((query) =>
      this.doRequest(query).then((response) => {
        const frame = new MutableDataFrame({
          refId: query.refId,
          fields: [
            { name: 'Time', type: FieldType.time },
            { name: 'Value', type: FieldType.number },
          ],
        });

        let response_data = response.data;
        this.data.push(response_data);

        this.data.forEach((point: any) => {
          frame.appendRow([new Date(point['time_stamp']), point['data'][0]]);
        });

        return frame;
      })
    );

    return Promise.all(promises).then((data) => ({ data }));
  }

  async doWrite(value: number[]) {
    console.log('doRequest');
    const result = await getBackendSrv().datasourceRequest({
      method: 'POST',
      url: 'http://localhost:8080/pvapi/pv/write/random_walk:dt',
      data: value,
      headers: { TOKEN: this.apiKey },
    });

    return result;
  }

  async doRequest(query: MyQuery) {
    console.log('doRequest');
    const result = await getBackendSrv().datasourceRequest({
      method: 'GET',
      url: 'http://localhost:8080/pvapi/pv/read/random_walk:dt',
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
