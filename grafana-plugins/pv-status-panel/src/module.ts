import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './SimplePanel';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setPanelOptions(builder => {
  return builder.addTextInput({
    path: 'fieldName',
    name: 'Name of field to display',
    description: 'Name of field to display',
    defaultValue: 'Value',
  });
});
