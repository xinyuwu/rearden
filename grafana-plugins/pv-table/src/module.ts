import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { PVTable } from './PVTable';

export const plugin = new PanelPlugin<SimpleOptions>(PVTable).setPanelOptions(builder => {
  return builder
    .addStringArray({
      path: 'pv_fields',
      name: 'PV Fields',
      description: 'json string for pv fields to be displayed, eg: {"name": "Value","width": 0.2,"precision": 2}',
      defaultValue: ['{ "name": "Value", "width": 0.8, "decimal_precision": 2 }'],
    })
    .addTextInput({
      path: 'background_field',
      name: 'Name of field to use as background color',
      defaultValue: 'alarm_severity',
    })
    .addBooleanSwitch({
      path: 'show_name',
      name: 'show refId as column',
      defaultValue: true,
    });
});
