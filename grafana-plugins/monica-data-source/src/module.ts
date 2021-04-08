import { DataSourcePlugin } from '@grafana/data';
import { MonicaDataSource } from './MonicaDataSource';
import { ConfigEditor } from './ConfigEditor';
import { QueryEditor } from './QueryEditor';
import { MyQuery, MyDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<MonicaDataSource, MyQuery, MyDataSourceOptions>(MonicaDataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
