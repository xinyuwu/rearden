import React, { useState } from 'react';
import { LegacyForms } from '@grafana/ui';

import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory, useTheme } from '@grafana/ui';

import { getDataSourceSrv } from '@grafana/runtime';

const { FormField } = LegacyForms;

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const [state, setState] = useState({ loading: false });
  const [message, setMessage] = useState('');
  const [pvValue, setPvValue] = useState('');

  const theme = useTheme();
  const styles = getStyles();
  let color: string;
  switch (options.color) {
    case 'red':
      color = theme.palette.redBase;
      break;
    case 'green':
      color = theme.palette.greenBase;
      break;
    case 'blue':
      color = theme.palette.blue95;
      break;
  }

  async function userAction() {
    setState({ ...state, loading: true });
    const dataSourceSrv: any = getDataSourceSrv();
    const dataSources = dataSourceSrv.datasources;
    const dataSource = dataSources[Object.keys(dataSources)[0]];
    console.log('Hello world: ' + dataSource);
    dataSource.doWrite('random_walk:dt', [Number(pvValue)]).then((response: any) => {
      const responseData = response.data;
      console.log('responseData', responseData);
      setMessage(responseData['message']);
    });
  }

  const radii: number[] = [];

  data.series.forEach((dataFrame) => {
    let values = dataFrame.fields[1].values;
    for (let i = 0; i < values.length; i++) {
      let val = values.get(i);
      radii.push(val);
      // console.log(val);
    }
  });

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
      <svg width={width} height={height - 150}>
        <g fill={color}>
          {radii.map((radius, index) => {
            const step = width / radii.length;
            return (
              <circle
                key={index}
                r={Math.abs(radius * 10)}
                transform={`translate(${index * step + step / 2}, ${height / 2})`}
              />
            );
          })}
        </g>
      </svg>

      <div>
        <FormField
          label="New PV Value"
          placeholder="Enter a new PV value"
          onChange={(e) => setPvValue(e.target.value)}
          value={pvValue}
        />
        <button onClick={userAction}>Clickme</button>
        <p>{message}</p>
      </div>

      <div className={styles.textBox}>
        {options.showSeriesCount && (
          <div
            className={css`
              font-size: ${theme.typography.size[options.seriesCountSize]};
            `}
          >
            Number of series: {data.series.length}
          </div>
        )}
        <div>Text option value: {options.text}</div>
      </div>
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
