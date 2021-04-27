import { PanelPlugin } from '@grafana/data';
import { PVStatusOptions } from './types';
import { PVStatusPanel } from './PVStatusPanel';

export const plugin = new PanelPlugin<PVStatusOptions>(PVStatusPanel).setPanelOptions(builder => {
  return builder
    .addTextInput({
      path: 'fieldName',
      name: 'Name of field to display',
      description: 'Name of field to display',
      defaultValue: 'Value',
    })
    .addTextInput({
      path: 'url_link',
      name: 'URL link to dashboard',
      description: 'The url to the dashboard to go to when a bar is clicked',
    });
});
