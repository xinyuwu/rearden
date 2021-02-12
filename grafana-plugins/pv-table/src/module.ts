import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './SimplePanel';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setPanelOptions(builder => {
  return builder.addStringArray({
    path: 'pv_fields',
    name: 'PV Fields',
    description: 'json string for pv fields to be displayed, eg: {"name": "Value","width": 0.2,"precision": 2}',
    defaultValue: ['{ "name": "Value", "width": 0.8, "decimal_precision": 2 }'],
  });
});
