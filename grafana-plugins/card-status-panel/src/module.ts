import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { CardStatusPanel } from './CardStatusPanel';

export const plugin = new PanelPlugin<SimpleOptions>(CardStatusPanel).setPanelOptions(builder => {
  return builder
    .addTextInput({
      path: 'statusFieldName',
      name: 'Name of field to display as status',
      defaultValue: 'Value',
    })
    .addStringArray({
      path: 'statusColorMapping',
      name: 'Status value color mapping',
      description: 'json string for status field value to color mapping, eg: {"value": 1,"color": "#43A047"}',
      defaultValue: ['{"value": 1,"color": "#43A047"}'],
    })
    .addTextInput({
      path: 'borderFieldName',
      name: 'Name of field to display as border',
      defaultValue: 'alarm_status',
    })
    .addStringArray({
      path: 'borderColorMapping',
      name: 'Border value color mapping',
      description:
        'json string for status field value to color mapping, eg: {"value": "disable_alarm","color": "#E91E63"}',
      defaultValue: ['{"value": "disable_alarm","color": "#E91E63"}'],
    });
});
