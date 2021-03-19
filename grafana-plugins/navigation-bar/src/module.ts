import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './SimplePanel';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setPanelOptions(builder => {
  return builder
    .addTextInput({
      path: 'var_name',
      name: 'Dashboard Variable',
      description: 'Name of Dashboard Variable',
      defaultValue: 'healthType',
    })
    .addTextInput({
      path: 'field_name',
      name: 'Value corresponding to the field name to display',
      description: 'Name of field name',
      defaultValue: 'alarm_status',
    })
    .addStringArray({
      path: 'field_mapping',
      name: 'refId to dashboard variable value mapping',
      description: '',
      defaultValue: ['Health:health'],
    });
});
