import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { PVStatusPanel } from './PVStatusPanel';

export const plugin = new PanelPlugin<SimpleOptions>(PVStatusPanel).setPanelOptions(builder => {
  return builder.addTextInput({
    path: 'fieldName',
    name: 'Name of field to display',
    description: 'Name of field to display',
    defaultValue: 'Value',
  });
});
