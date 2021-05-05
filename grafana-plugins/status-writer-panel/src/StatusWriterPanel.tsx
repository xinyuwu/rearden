import React from 'react';
import './plugin.css';
import { PanelProps, DataFrame } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory } from '@grafana/ui';
import Checkbox from '@material-ui/core/Checkbox';
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

  let statusMatrix: boolean[][] = [];
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

  let [state, setState] = React.useState<{ matrix: boolean[][] }>({
    matrix: statusMatrix,
  });

  console.log('status writer panel');

  function handleStatusChange(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    pvName: string,
    row: number,
    col: number
  ) {
    let checked = !state.matrix[row][col];
    let value = checked ? checkedValue : uncheckedValue;

    console.log('handleStatusChange ' + pvName + ' checked: ' + checked);

    let dataSourceSrv: any = getDataSourceSrv();
    let dataSources = dataSourceSrv.datasources;
    let dataSource = dataSources[Object.keys(dataSources)[0]];
    dataSource.doWrite(pvName, [value]).then((response: any) => {
      let responseData = response.data;
      console.log('responseData', responseData);
    });
    statusMatrix[row][col] = checked;
    setState({
      ...state,
      ['matrix']: statusMatrix,
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
              <Checkbox
                className="checkbox"
                style={{ color: getColor(series, statusFieldName, col) }}
                color="primary"
                disabled={getField(series, statusFieldName, col) === ''}
                checked={state.matrix[row][col]}
                onClick={e => handleStatusChange(e, getField(series, 'name', col), row, col)}
                inputProps={{ 'aria-label': 'primary checkbox' }}
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

function getColor(dataFrame: DataFrame | null, fieldName: string, index: number): string {
  if (dataFrame === null) {
    return 'transparent';
  }

  for (let field of dataFrame.fields) {
    if (field['name'] === fieldName) {
      if (field.values && field.values.length > index) {
        if (!isNaN(field.values.get(index))) {
          return '';
        }
      }
    }
  }

  return 'transparent';
}

function getField(dataFrame: DataFrame | null, fieldName: string, index: number): string {
  if (dataFrame === null) {
    return '';
  }

  for (let field of dataFrame.fields) {
    if (field['name'] === fieldName) {
      if (field.values && field.values.length > index) {
        return field.values.get(index).toString();
      }
    }
  }

  return '';
}
