import { DataQuery, DataSourceJsonData } from '@grafana/data';

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  path?: string;
}

export interface MyQuery extends DataQuery {
  pv_name?: string;
}

export const defaultQuery: Partial<MyQuery> = {
  pv_name: '',
};

export interface MySecureJsonData {
  apiKey?: string;
}
