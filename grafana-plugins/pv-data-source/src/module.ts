import { DataSourcePlugin } from '@grafana/data';
import { XinyuDataSource } from './DataSource';
import { ConfigEditor } from './ConfigEditor';
import { QueryEditor } from './QueryEditor';
import { MyQuery, MyDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<XinyuDataSource, MyQuery, MyDataSourceOptions>(XinyuDataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
