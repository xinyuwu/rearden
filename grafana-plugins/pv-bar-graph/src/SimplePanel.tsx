import React from 'react';
import { PanelProps, DataFrame } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory } from '@grafana/ui';
import './plugin.css';

import * as d3 from 'd3';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  // const theme = useTheme();
  const styles = getStyles();

  const barScale = d3
    .scaleLinear()
    .domain([0, 50])
    .nice()
    .range([0, height]);

  let dataFrame = null;
  let barHeight = 0;

  if (data.series.length > 0) {
    dataFrame = data.series[0];
    let val = getValue(dataFrame, 'Value');
    barHeight = barScale(parseFloat(val));
  }

  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      <svg
        className={styles.svg}
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <g className="pv-bar">
          <rect style={{ fill: `#BDBDBD` }} x={0} y={0} height={height} width={width} />
          <rect
            className={getValue(dataFrame, 'alarm_severity').toLowerCase()}
            x={0}
            y={height - barHeight}
            height={barHeight}
            width={width}
          />
        </g>
      </svg>
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

function getValue(dataFrame: DataFrame | null, fieldName: string): string {
  if (dataFrame === null) {
    return '';
  }

  for (let field of dataFrame.fields) {
    if (field['name'] === fieldName) {
      const list = field.values;
      if (list && list.length > 0) {
        let val = list.get(list.length - 1);
        return val!;
      }
    }
  }
  return '';
}
