import { DataQuery, DataSourceJsonData } from '@grafana/data';

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  path?: string;
  apiKey?: string;
}

export interface MyQuery extends DataQuery {
  point_name?: string;
}

export const defaultQuery: Partial<MyQuery> = {
  point_name: '',
};
