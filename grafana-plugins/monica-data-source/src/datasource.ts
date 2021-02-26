import { getBackendSrv } from '@grafana/runtime';
import * as d3 from 'd3';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions } from './types';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const { range } = options;

    const parser = d3.utcParse('%Y-%m-%d %H:%M:%S.%L');

    const promises = options.targets.map(query =>
      this.doHistoryRequest(query, range!).then(response => {
        const frame = new MutableDataFrame({
          refId: query['point_name'],
          fields: [
            { name: 'Time', type: FieldType.time },
            { name: 'Value', type: FieldType.other },
            { name: 'alarm_status', type: FieldType.string },
            { name: 'alarm_severity', type: FieldType.string },
          ],
        });

        let response_data = response['data']['pointData'];
        for (let point of response_data) {
          let alarm_status = 'no_alarm';
          let alarm_severity = 'no_alarm';
          if (!point['errorState']) {
            alarm_status = 'alarm';
            alarm_severity = 'alarm';
          }

          frame.appendRow([parser(point['time']), point['value'], alarm_status, alarm_severity]);
        }

        return frame;
      })
    );

    return Promise.all(promises).then(data => ({ data }));
  }

  // async doLatestValueRequest(pvNames: string[]) {
  //   console.log('doRequest ' + query['pv_name']);
  //
  //   if (pvNames === null || pvNames.length == 0) {
  //     return {};
  //   }
  //
  //   let queryData = {
  //     "type": "get",
  //     "points": pvNames
  //   }
  //   const result = await getBackendSrv().datasourceRequest({
  //     method: 'POST',
  //     url: 'http://localhost:8080/monica/points',
  //     data: queryData,
  //   });
  //
  //   return result;
  // }

  async doHistoryRequest(query: MyQuery, range: any) {
    console.log('doHistoryRequest ' + query['point_name']);

    if (query['point_name'] === '') {
      return {};
    }

    const format = d3.utcFormat('%Y-%m-%d %H:%M:%S');
    const from = new Date(range!.from.valueOf());
    const to = new Date(range!.to.valueOf());

    let queryData = {
      type: 'between',
      start: format(from),
      end: format(to),
      points: [query['point_name']],
    };

    const result = await getBackendSrv().datasourceRequest({
      method: 'POST',
      url: 'http://localhost:8080/monica/points',
      data: queryData,
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
