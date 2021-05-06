import React from 'react';
import './plugin.css';
import { PanelProps, DataFrame } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory } from '@grafana/ui';
import { config, getDataSourceSrv } from '@grafana/runtime';

interface Props extends PanelProps<SimpleOptions> {}

export const StatusWriterPanel: React.FC<Props> = ({ options, data, width, height }) => {
  let statusFieldName = options.statusFieldName;
  let checkedValue = options.checkedValue;
  let uncheckedValue = options.uncheckedValue;

  let columnCount = 0;
  if (data.series && data.series.length > 0) {
    columnCount = data.series[0].fields[0].values.length;
  }

  let isDark = config.theme.isDark;
  let textClass = isDark ? 'dark-text' : 'light-text';
  const styles = getStyles();

  let statusMatrix: any[] = [];
  for (let dataFrame of data.series) {
    let statusList: boolean[] = [];
    for (let field of dataFrame.fields) {
      if (field['name'] === statusFieldName) {
        for (let val of field.values.toArray()) {
          statusList.push(val.toString() === checkedValue);
        }
      }
    }
    statusMatrix.push(statusList);
  }

  console.log('status writer panel');

  function handleStatusChange(event: React.ChangeEvent<HTMLInputElement>, pvName: string, row: number, col: number) {
    let checked = !statusMatrix[row][col];
    let value = checked ? checkedValue : uncheckedValue;

    statusMatrix[row][col] = checked;

    console.log('handleStatusChange ' + pvName + ' checked: ' + checked);

    let dataSourceSrv: any = getDataSourceSrv();
    let dataSources = dataSourceSrv.datasources;
    let dataSource = dataSources[Object.keys(dataSources)[0]];
    dataSource.doWrite(pvName, [value]).then((response: any) => {
      event.target['checked'] = checked;
      let responseData = response.data;
      console.log('responseData', responseData);
    });
  }

  return (
    <div
      id="status-writer-div"
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      {data.series.map((series: any, row: number) => (
        <div className="status-writer-row">
          <div className={[textClass, 'status-writer-title'].join(' ')}>{series.refId}</div>
          {Array(columnCount)
            .fill(0)
            .map((_, col) => (
              <input
                type="checkbox"
                className="checkbox"
                checked={statusMatrix[row][col]}
                disabled={getField(series, statusFieldName, col) === ''}
                onChange={e => handleStatusChange(e, getField(series, 'name', col), row, col)}
              />
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

function getField(dataFrame: DataFrame | null, fieldName: string, index: number): string {
  if (dataFrame === null) {
    return '';
  }

  for (let field of dataFrame.fields) {
    if (field['name'] === fieldName) {
      if (field.values && field.values.length > index) {
        if (isNaN(field.values.get(index))
            && typeof(field.values.get(index))=='number')
          return '';

        return field.values.get(index).toString();
      }
    }
  }

  return '';
}
