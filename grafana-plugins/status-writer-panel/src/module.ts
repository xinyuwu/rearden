import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { StatusWriterPanel } from './StatusWriterPanel';

export const plugin = new PanelPlugin<SimpleOptions>(StatusWriterPanel).setPanelOptions(builder => {
  return builder
    .addTextInput({
      path: 'statusFieldName',
      name: 'Name of field to display as status',
      defaultValue: 'Value',
    })
    .addTextInput({
      path: 'checkedValue',
      name: 'Value to be considered checked',
      defaultValue: '1',
    })
    .addTextInput({
      path: 'uncheckedValue',
      name: 'Value to be considered unchecked',
      defaultValue: '0',
    });
});
