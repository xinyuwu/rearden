import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { NavigationBar } from './NavigationBar';

export const plugin = new PanelPlugin<SimpleOptions>(NavigationBar).setPanelOptions(builder => {
  return builder
    .addTextInput({
      path: 'var_name',
      name: 'Dashboard Variable',
      description: 'Name of Dashboard Variable',
      defaultValue: 'healthType',
    })
    .addTextInput({
      path: 'field_name',
      name: 'Field name to display',
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
