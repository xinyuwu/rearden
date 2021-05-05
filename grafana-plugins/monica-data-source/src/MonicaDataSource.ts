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

export class MonicaDataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  path = '';

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.path = '/api/datasources/proxy/' + this.id + '/points';
    console.log('MonicaDataSource');
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    let templateSrv = getTemplateSrv();
    let variables = templateSrv.getVariables();
    let scopedVars = options.scopedVars;

    console.log('variables ' + variables);

    let parser = d3.utcParse('%Y-%m-%d %H:%M:%S.%L');
    let frames: MutableDataFrame[] = [];

    if (options.maxDataPoints === 1) {
      let refIdMap = new Map();
      let pvNames = options.targets.map(query => {
        let name = templateSrv.replace(query['point_name'], scopedVars);
        refIdMap.set(name, query['refId']);
        return name;
      });

      let promise = this.doLatestValueRequest(pvNames).then((response: any) => {
        let response_data = response['data']['pointData'];

        for (let point of response_data) {
          let frame = new MutableDataFrame({
            refId: refIdMap.get(point['pointName']),
            name: point['pointName'],
            fields: [
              { name: 'Time', type: FieldType.time },
              { name: 'Value', type: FieldType.other },
              { name: 'alarm_status', type: FieldType.string },
              { name: 'alarm_severity', type: FieldType.string },
              { name: 'raw_value', type: FieldType.string },
            ],
          });
          let alarm_status = 'no_alarm';
          let alarm_severity = 'no_alarm';
          if (!point['errorState']) {
            alarm_status = 'alarm';
            alarm_severity = 'alarm';
          }

          frame.appendRow([parser(point['time']), point['value'], alarm_status, alarm_severity, JSON.stringify(point)]);
          frames.push(frame);
        }

        return frames;
      });

      return promise.then(data => ({
        data,
      }));
    }

    let { range } = options;
    let promises = options.targets.map(query =>
      this.doHistoryRequest(query, range!, options['maxDataPoints']).then(response => {
        let frame = new MutableDataFrame({
          name: query['point_name'],
          refId: query['refId'],
          fields: [
            { name: 'Time', type: FieldType.time },
            { name: 'Value', type: FieldType.other },
            { name: 'alarm_status', type: FieldType.string },
            { name: 'alarm_severity', type: FieldType.string },
            { name: 'raw_value', type: FieldType.string },
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

          frame.appendRow([parser(point['time']), point['value'], alarm_status, alarm_severity, JSON.stringify(point)]);
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

    let result = await getBackendSrv().datasourceRequest({
      method: 'POST',
      url: this.path,
      data: queryData,
    });
    return result;
  }

  async doHistoryRequest(query: MyQuery, range: any, maxDataPoints: number | undefined): Promise<any> {
    console.log('doHistoryRequest ' + query['point_name']);

    if (query['point_name'] === '') {
      return {};
    }

    const format = d3.utcFormat('%Y-%m-%d %H:%M:%S');
    let from = new Date(range!.from.valueOf());
    let to = new Date(range!.to.valueOf());

    let queryData: any = {};

    queryData.type = 'between';
    queryData.start = format(from);
    queryData.end = format(to);
    queryData.points = [query['point_name']];

    if (maxDataPoints) {
      queryData.maxCount = maxDataPoints.toString();
    }

    let result = await getBackendSrv().datasourceRequest({
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
