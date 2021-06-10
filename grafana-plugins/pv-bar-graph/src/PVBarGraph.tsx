import React from 'react';
import { PanelProps, DataFrame } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory } from '@grafana/ui';
import './plugin.css';
import { config } from '@grafana/runtime';
import Tooltip from '@material-ui/core/Tooltip';

import * as d3 from 'd3';

interface Props extends PanelProps<SimpleOptions> {}

export const PVBarGraph: React.FC<Props> = ({ options, data, width, height }) => {
  const styles = getStyles();
  const barMargin = 5;
  let maxVal = 50;

  let isDark = config.theme.isDark;
  let textClass = isDark ? 'dark-text' : 'light-text';

  let barWidth = width;
  let dataFrame: any = null;
  let barCount = 0;

  if (data.series.length > 0) {
    dataFrame = data.series[0];
    let range = [];
    for (let field of dataFrame.fields) {
      if (field['name'] === 'Value') {
        range = field.values;
        break;
      }
    }

    range = range.map((d: any) => (d === '' ? 0 : d));
    maxVal = Number(d3.max(range));

    barCount = dataFrame.length;
    if (barCount > 0) {
      barWidth = (width - barMargin * barCount) / barCount;
    }
  }

  let barHeight = height - 10;

  let barScale = d3.scaleLinear().domain([0, maxVal]).nice().range([0, barHeight]);

  console.log('pv bar graph');

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
        {Array(barCount)
          .fill(0)
          .map((_, index) => (
            <g className="pv-bar" key={index}>
              <Tooltip title={getValue(dataFrame, 'raw_value', index)} placement="top">
                <rect className="pv-bar-base" x={index * (barWidth + barMargin)} height={barHeight} width={barWidth} />
              </Tooltip>
              <Tooltip title={getValue(dataFrame, 'raw_value', index)} placement="top">
                <rect
                  className={getValue(dataFrame, 'alarm_severity', index).toLowerCase()}
                  x={index * (barWidth + barMargin)}
                  y={barHeight - getScaledValue(getValue(dataFrame, 'Value', index), barScale)}
                  height={getScaledValue(getValue(dataFrame, 'Value', index), barScale)}
                  width={barWidth}
                />
              </Tooltip>
              <text
                className={['status-label', textClass].join(' ')}
                x={index * (barWidth + barMargin) + barWidth / 2}
                y={height}
              >
                {index + 1}
              </text>
            </g>
          ))}
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

function getScaledValue(val: string, scale: any) {
  let numVal = Number(val);
  if (!isNaN(numVal)) {
    return scale(numVal);
  }

  return 0;
}

function getValue(dataFrame: DataFrame | null, fieldName: string, index: number): string {
  if (dataFrame === null) {
    return '';
  }

  for (let field of dataFrame.fields) {
    if (field['name'] === fieldName) {
      let list = field.values;
      if (list && list.length > 0) {
        let val = list.get(index);
        return val!;
      }
    }
  }
  return '';
}
