import { getBackendSrv, getTemplateSrv } from '@grafana/runtime';

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
  path = '';

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.path = '/api/datasources/proxy/' + this.id + '/points';
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const templateSrv = getTemplateSrv();
    const variables = templateSrv.getVariables();
    const scopedVars = options.scopedVars;

    console.log('variables ' + variables);

    const parser = d3.utcParse('%Y-%m-%d %H:%M:%S.%L');
    let frames: MutableDataFrame[] = [];

    if (options.maxDataPoints === 1) {
      let pvNames = options.targets.map(query => {
        const name = templateSrv.replace(query['point_name'], scopedVars);
        return name;
      });

      let promise = this.doLatestValueRequest(pvNames).then((response: any) => {
        let response_data = response['data']['pointData'];

        for (let point of response_data) {
          const frame = new MutableDataFrame({
            refId: point['refId'],
            name: point['pointName'],
            fields: [
              { name: 'Time', type: FieldType.time },
              { name: 'Value', type: FieldType.other },
              { name: 'alarm_status', type: FieldType.string },
              { name: 'alarm_severity', type: FieldType.string },
            ],
          });
          let alarm_status = 'no_alarm';
          let alarm_severity = 'no_alarm';
          if (!point['errorState']) {
            alarm_status = 'alarm';
            alarm_severity = 'alarm';
          }

          frame.appendRow([parser(point['time']), point['value'], alarm_status, alarm_severity]);
          frames.push(frame);
        }

        return frames;
      });

      return promise.then(data => ({
        data,
      }));
    }

    const { range } = options;
    const promises = options.targets.map(query =>
      this.doHistoryRequest(query, range!).then(response => {
        const frame = new MutableDataFrame({
          name: query['point_name'],
          refId: query['refId'],
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

    return Promise.all(promises).then(data => ({
      data,
    }));
  }

  async doLatestValueRequest(pvNames: Array<string | undefined>) {
    console.log('doLatestValueRequest ' + pvNames.length);

    if (pvNames === null || pvNames.length === 0) {
      return {};
    }

    let queryData = {
      type: 'get',
      points: pvNames,
    };

    const result = await getBackendSrv().datasourceRequest({
      method: 'POST',
      url: this.path,
      data: queryData,
    });
    return result;
  }

  async doHistoryRequest(query: MyQuery, range: any): Promise<any> {
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
      url: this.path,
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
