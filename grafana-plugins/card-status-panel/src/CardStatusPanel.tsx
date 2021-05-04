import React from 'react';
import './plugin.css';
import { PanelProps, DataFrame } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory } from '@grafana/ui';
import { config } from '@grafana/runtime';
import Brightness1Icon from '@material-ui/icons/Brightness1';

interface Props extends PanelProps<SimpleOptions> {}

export const CardStatusPanel: React.FC<Props> = ({ options, data, width, height }) => {
  const statusFieldName = options.statusFieldName;
  const statusColorMappings = options.statusColorMapping;
  const borderFieldName = options.borderFieldName;
  const borderColorMappings = options.borderColorMapping;

  const statusColorMapping = new Map();
  for (let mapping of statusColorMappings) {
    let obj = JSON.parse(mapping);
    statusColorMapping.set(obj['value'], obj['color']);
  }

  const borderColorMapping = new Map();
  for (let mapping of borderColorMappings) {
    let obj = JSON.parse(mapping);
    borderColorMapping.set(obj['value'], obj['color']);
  }

  let columnCount = 0;
  if (data.series && data.series.length>0)
    columnCount = data.series[0].fields[0].values.length;

  let isDark = config.theme.isDark;
  let textClass = isDark ? 'dark-text' : 'light-text';

  const styles = getStyles();

  console.log('card status graph');

  return (
    <div
      id="card-status-div"
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      {data.series.map((series: any) => (
        <div className="card-status-row">
          <div className={[textClass, 'card-status-title'].join(' ')}>{series.refId}</div>
          {Array(columnCount)
            .fill(0)
            .map((_, col) => (
              <div style= {{ color: getColor(borderColorMapping, getField(series, borderFieldName, col), 'transparent') }}
                className='card-status-border'>
                <Brightness1Icon style= {{ color: getColor(statusColorMapping, getField(series, statusFieldName, col), 'transparent') }}
                  className='card-status-indicator' />
              </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const getStyles = stylesFactory(() => {
  return {
    wrapper: css`
      position: relative;
    `,
    svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
  };
});

function getField(dataFrame: DataFrame | null, fieldName: string, index: number): any {
  if (dataFrame === null) {
    return '';
  }

  for (let field of dataFrame.fields) {
    if (field['name'] === fieldName) {
      if (field.values && field.values.length > index) {
        return field.values.get(index);
      }
    }
  }

  return '';
}

function getColor(mapping: any, value: any, defaultColor: string): string {
  if (mapping)
   if (mapping.get('' + value))
    return mapping.get('' + value).toString();

  return defaultColor;
}
