import { DataQuery, DataSourceJsonData } from '@grafana/data';

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  path?: string;
  resolution?: number;
  apiKey?: string;
}

export interface MyQuery extends DataQuery {
  queryText?: string;
  constant: number;
  frequency: number;
}

export const defaultQuery: Partial<MyQuery> = {
  constant: 6.5,
  frequency: 1.0,
};
