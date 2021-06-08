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
      path: 'graph_url',
      name: 'URL of dashboard to disply graph of the pv',
      description: 'URL of dashboard to disply graph of the pv',
      defaultValue: '',
    })
    .addStringArray({
      path: 'url_links',
      name: 'URL links for each item',
      description: 'The url to the dashboard to go to when a bar is clicked',
      defaultValue: ['{"refId": "A", "url": "/d/Kk190ojMz/card-control-panel?var-card=All&var-antenna=$antenna"}'],
    });
});
