import { DataSourcePlugin } from '@grafana/data';
import { PVDataSource } from './PVDataSource';
import { ConfigEditor } from './ConfigEditor';
import { QueryEditor } from './QueryEditor';
import { MyQuery, MyDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<PVDataSource, MyQuery, MyDataSourceOptions>(PVDataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
