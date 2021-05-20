import { DataSourcePlugin } from '@grafana/data';
import { OMPDataSource } from './OMPDataSource';
import { ConfigEditor } from './ConfigEditor';
import { QueryEditor } from './QueryEditor';
import { MyQuery, MyDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<OMPDataSource, MyQuery, MyDataSourceOptions>(OMPDataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
