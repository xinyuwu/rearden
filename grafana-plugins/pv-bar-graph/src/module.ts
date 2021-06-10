import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { PVBarGraph } from './PVBarGraph';

export const plugin = new PanelPlugin<SimpleOptions>(PVBarGraph).setPanelOptions((builder) => {
  return builder.addTextInput({
    path: 'repeat_var_name',
    name: 'Repeat by variable',
    description: 'Repeat the bars by variable',
    defaultValue: '',
  });
});
