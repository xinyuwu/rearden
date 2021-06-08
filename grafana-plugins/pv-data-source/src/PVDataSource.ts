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
  repeatVarMapping = new Map();

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.path = '/api/datasources/proxy/' + this.id;
    console.log('PVDataSource');
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    let timeStamp = new Date();
    let promises = options.targets.map((query) =>
      this.doRequest(query, options).then(
        (response) => {
          let frame = new MutableDataFrame({
            refId: query['refId'],
            fields: [
              { name: 'name', type: FieldType.string },
              { name: 'Time', type: FieldType.time },
              { name: 'Value_Time', type: FieldType.time },
              { name: 'Value', type: FieldType.other },
              { name: 'alarm_status', type: FieldType.string },
              { name: 'alarm_severity', type: FieldType.string },
              { name: 'raw_value', type: FieldType.string },
              { name: 'var_name', type: FieldType.string },
              { name: 'var_value', type: FieldType.string },
            ],
            meta: {
              preferredVisualisationType: 'logs',
            },
          });

          if (response['data']) {
            for (let response_data of response['data']) {
              let mapping = this.repeatVarMapping.get(response_data['name']);
              let var_name = '';
              let var_val = '';
              if (mapping) {
                var_name = mapping[0];
                var_val = mapping[1];
              }
              if (response_data['data']) {
                frame.appendRow([
                  response_data['name'],
                  timeStamp,
                  new Date(response_data['time_stamp']),
                  response_data['data'][0],
                  response_data['alarm_status'],
                  response_data['alarm_severity'],
                  JSON.stringify(response_data),
                  var_name,
                  var_val,
                ]);
              } else {
                frame.appendRow([
                  response_data['name'],
                  timeStamp,
                  null,
                  '',
                  '',
                  '',
                  JSON.stringify(response_data),
                  var_name,
                  var_val,
                ]);
              }
            }
          }

          return frame;
        },
        (reason) => {
          let frame = new MutableDataFrame({
            name: query['pv_name'],
            refId: query['refId'],
            fields: [
              { name: 'Time', type: FieldType.time },
              { name: 'Value_Time', type: FieldType.time },
              { name: 'Value', type: FieldType.other },
              { name: 'alarm_status', type: FieldType.string },
              { name: 'alarm_severity', type: FieldType.string },
              { name: 'raw_value', type: FieldType.string },
              { name: 'var_name', type: FieldType.string },
              { name: 'var_value', type: FieldType.string },
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
    let result = await getBackendSrv().datasourceRequest({
      method: 'POST',
      url: this.path + '/write/' + pvName,
      data: value,
    });

    return result;
  }

  async doRequest(query: MyQuery, options: DataQueryRequest<MyQuery>) {
    let templateSrv = getTemplateSrv();
    let scopedVars = options.scopedVars;
    let variables = getTemplateSrv().getVariables() as ExtendedVariableModel[];

    let pv_names = [];

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
      repeatVar = Array.from(repeatVar).sort();
      for (let val of repeatVar) {
        scopedVars[query['repeat_variable']!] = { text: val, value: val };
        let name = templateSrv.replace(query['pv_name'], scopedVars);
        pv_names.push(name);
        this.repeatVarMapping.set(name, [query['repeat_variable'], val]);
      }
    } else {
      let name = templateSrv.replace(query['pv_name'], scopedVars);
      pv_names.push(name);
    }

    if (pv_names === null || pv_names.length === 0) {
      return {};
    }

    let result = await getBackendSrv().datasourceRequest({
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
