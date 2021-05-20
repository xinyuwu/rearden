import { getBackendSrv } from '@grafana/runtime';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions } from './types';

export class OMPDataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  path = '';

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.path = '/api/datasources/proxy/' + this.id + '/';
    console.log('OMPDataSource');
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    let promises = options.targets.map(query =>
      this.doRequest(query, options).then(
        response => {
          let frame = new MutableDataFrame({
            refId: query['refId'],
            name: query['refId'],
            fields: [
              { name: 'id', type: FieldType.number },
              { name: 'alias', type: FieldType.string },
              { name: 'start', type: FieldType.number },
              { name: 'end', type: FieldType.number },
              { name: 'state', type: FieldType.string },
              { name: 'duration', type: FieldType.number },
              { name: 'owner', type: FieldType.string },
              { name: 'templateName', type: FieldType.string },
              { name: 'templateVersion', type: FieldType.string },
              { name: 'title', type: FieldType.string },
              { name: 'allDay', type: FieldType.boolean },
              { name: 'className', type: FieldType.string },
              { name: 'rendering', type: FieldType.string },
              { name: 'projectList', type: FieldType.string },
              { name: 'raw_value', type: FieldType.string },
            ],
          });

          if (response['data']) {
            for (let response_data of response['data']['events']) {
              frame.appendRow([
                response_data['id'],
                response_data['alias'],
                response_data['start'],
                response_data['end'],
                response_data['state'],
                response_data['duration'],
                response_data['owner'],
                response_data['templateName'],
                response_data['templateVersion'],
                response_data['title'],
                response_data['allDay'],
                response_data['className'],
                response_data['rendering'],
                JSON.stringify(response_data['projectList']),
                JSON.stringify(response_data),
              ]);
            }
          }

          return frame;
        },
        reason => {
          let frame = new MutableDataFrame({
            name: query['command'],
            refId: query['refId'],
            fields: [
              { name: 'id', type: FieldType.number },
              { name: 'alias', type: FieldType.string },
              { name: 'start', type: FieldType.number },
              { name: 'end', type: FieldType.number },
              { name: 'state', type: FieldType.string },
              { name: 'duration', type: FieldType.number },
              { name: 'owner', type: FieldType.string },
              { name: 'templateName', type: FieldType.string },
              { name: 'templateVersion', type: FieldType.string },
              { name: 'title', type: FieldType.string },
              { name: 'allDay', type: FieldType.boolean },
              { name: 'className', type: FieldType.string },
              { name: 'rendering', type: FieldType.string },
              { name: 'projectList', type: FieldType.string },
              { name: 'raw_value', type: FieldType.string },
            ],
          });

          return frame;
        }
      )
    );

    return Promise.all(promises).then(data => ({ data }));
  }

  async doRequest(query: MyQuery, options: DataQueryRequest<MyQuery>) {
    let result = await getBackendSrv().datasourceRequest({
      method: 'GET',
      url: this.path + query.command,
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
