import React from 'react';
import { PanelProps, DataFrame } from '@grafana/data';
import { config } from '@grafana/runtime';
import { PVStatusOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory } from '@grafana/ui';
import './plugin.css';
import Tooltip from '@material-ui/core/Tooltip';

interface Props extends PanelProps<PVStatusOptions> {}

export const PVStatusPanel: React.FC<Props> = ({ options, data, width, height }) => {
  const fieldName = options.fieldName;
  const link = options.url_link;

  let isDark = config.theme.isDark;
  let textClass = isDark ? 'dark-text' : 'light-text';

  const styles = getStyles();

  let maxTitleLength = 5;
  let titleLengths = data.series.map(frame => (frame.refId ? frame.refId.length : 0));
  maxTitleLength = Math.max(...titleLengths);

  const charSize = 12;
  let nodeMargin = 5;
  let titleWidth = charSize * maxTitleLength;

  let nodeWidth = width;
  let nodeHeight = height;
  let numberOfColumns = 0;

  if (data.series.length > 0) {
    nodeHeight = (height - nodeMargin * data.series.length - charSize) / data.series.length;

    let fields = data.series[0].fields;
    nodeWidth = (width - titleWidth - nodeMargin * fields[0].values.length) / fields[0].values.length;
    numberOfColumns = fields[0].values.length;
  }

  console.log('pv status graph ' + maxTitleLength);

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
        {data.series.map((series: any, i: number) => (
          <g className="pv-status">
            <text x={0} className={textClass} y={i * (nodeHeight + nodeMargin) + (nodeHeight + charSize) / 2}>
              {series.refId}
            </text>
            {getFields(series, fieldName).map((field: any, j: number) => (
              <Tooltip title={getFields(series, 'raw_value').get(j)} placement="top">
                <rect
                  className={[field.toLowerCase().replace(' ', '-'), 'pv-status-rect'].join(' ')}
                  x={j * (nodeWidth + nodeMargin) + titleWidth}
                  y={i * (nodeHeight + nodeMargin)}
                  height={nodeHeight}
                  width={nodeWidth}
                  onClick={e => goToURL(e, link)}
                />
              </Tooltip>
            ))}
          </g>
        ))}
        {Array(numberOfColumns)
          .fill(0)
          .map((_, index) => (
            <text
              className={['status-label', textClass].join(' ')}
              x={index * (nodeWidth + nodeMargin) + nodeWidth / 2 - charSize / 2 + titleWidth}
              y={height}
            >
              {index + 1}
            </text>
          ))}
      </svg>
    </div>
  );
};

function goToURL(event: any, url: string) {
  window.open(url, '_blank');
}

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

function getFields(dataFrame: DataFrame | null, fieldName: string): any {
  if (dataFrame === null) {
    return [];
  }

  for (let field of dataFrame.fields) {
    if (field['name'] === fieldName) {
      return field.values;
    }
  }

  return [];
}
