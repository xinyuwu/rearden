import { getBackendSrv, getTemplateSrv } from '@grafana/runtime';

import {
  DataQueryRequest,
  DataSourceApi,
  DataQueryResponse,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
  VariableModel,
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions } from './types';

// Extend VariableModel  to avoid ts errors
interface ExtendedVariableModel extends VariableModel {
  current: {
    selected: boolean;
    value: any;
    text: string;
  };
  options: any[];
}

export class PVDataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  path = '';

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.path = '/api/datasources/proxy/' + this.id;
    console.log('PVDataSource');
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const timeStamp = new Date();
    const promises = options.targets.map((query) =>
      this.doRequest(query, options).then(
        (response) => {
          const frame = new MutableDataFrame({
            refId: query['refId'],
            fields: [
              { name: 'name', type: FieldType.string },
              { name: 'Time', type: FieldType.time },
              { name: 'Value_Time', type: FieldType.time },
              { name: 'Value', type: FieldType.other },
              { name: 'alarm_status', type: FieldType.string },
              { name: 'alarm_severity', type: FieldType.string },
              { name: 'raw_value', type: FieldType.string },
            ],
            meta: {
              preferredVisualisationType: 'logs',
            },
          });

          if (response['data']) {
            for (let response_data of response['data']) {
              if (response_data['data']) {
                frame.appendRow([
                  response_data['name'],
                  timeStamp,
                  new Date(response_data['time_stamp']),
                  response_data['data'][0],
                  response_data['alarm_status'],
                  response_data['alarm_severity'],
                  JSON.stringify(response_data),
                ]);
              } else {
                frame.appendRow([response_data['name'], timeStamp, null, '', '', '', JSON.stringify(response_data)]);
              }
            }
          }

          return frame;
        },
        (reason) => {
          const frame = new MutableDataFrame({
            name: query['pv_name'],
            refId: query['refId'],
            fields: [
              { name: 'Time', type: FieldType.time },
              { name: 'Value_Time', type: FieldType.time },
              { name: 'Value', type: FieldType.other },
              { name: 'alarm_status', type: FieldType.string },
              { name: 'alarm_severity', type: FieldType.string },
              { name: 'raw_value', type: FieldType.string },
            ],
          });

          return frame;
        }
      )
    );

    return Promise.all(promises).then((data) => ({ data }));
  }

  async doWrite(pvName: string, value: any[]) {
    console.log('doWrite ' + pvName);
    const result = await getBackendSrv().datasourceRequest({
      method: 'POST',
      url: this.path + '/write/' + pvName,
      data: value,
    });

    return result;
  }

  async doRequest(query: MyQuery, options: DataQueryRequest<MyQuery>) {
    const templateSrv = getTemplateSrv();
    const scopedVars = options.scopedVars;
    const variables = getTemplateSrv().getVariables() as ExtendedVariableModel[];

    const pv_names = [];

    let repeatVar = [];
    if (query['repeat_variable']) {
      for (let v of variables) {
        if (v['name'] === query['repeat_variable']) {
          let value = v['current']['value'];
          if (value.length === 1 && value[0] === '$__all') {
            repeatVar = v['options']
              .map((option: any) => {
                if (option.value !== '$__all') {
                  return option.value;
                }
                return '';
              })
              .filter((val) => {
                return val !== '';
              });
          } else {
            if (Array.isArray(v['current']['value'])) {
              repeatVar = v['current']['value'];
            } else {
              repeatVar = [v['current']['value']];
            }
          }
        }
      }
    }

    if (repeatVar && repeatVar.length >= 1) {
      for (let val of repeatVar) {
        scopedVars[query['repeat_variable']!] = { text: val, value: val };
        const name = templateSrv.replace(query['pv_name'], scopedVars);
        pv_names.push(name);
      }
    } else {
      const name = templateSrv.replace(query['pv_name'], scopedVars);
      pv_names.push(name);
    }

    if (pv_names === null || pv_names.length === 0) {
      return {};
    }

    const result = await getBackendSrv().datasourceRequest({
      method: 'POST',
      url: this.path + '/read',
      data: pv_names,
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
