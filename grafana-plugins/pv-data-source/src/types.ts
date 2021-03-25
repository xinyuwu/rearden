import { DataQuery, DataSourceJsonData } from '@grafana/data';

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  path?: string;
}

export interface MyQuery extends DataQuery {
  pv_name?: string;
  repeat_variable?: string;
}

export const defaultQuery: Partial<MyQuery> = {
  pv_name: '',
  repeat_variable: '',
};

export interface MySecureJsonData {
  apiKey?: string;
}
