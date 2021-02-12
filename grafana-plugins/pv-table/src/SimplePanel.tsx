import React from 'react';
import './plugin.css';
import { PanelProps, DataFrame } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const darkTheme = createMuiTheme({
    palette: {
      type: 'dark',
    },
  });

  const fields = options.pv_fields;

  const fieldConfigList: any[] = [];

  let widthList: number[] = [];

  fields.forEach(text => {
    let field = JSON.parse(text);
    fieldConfigList.push(field);
    let width = parseFloat(field['width']);

    if (!isNaN(width)) {
      if (width < 1) {
        width *= 100;
      }

      widthList.push(width);
    } else {
      widthList.push(0);
    }
  });

  let totalWidth = widthList.reduce((a, b) => a + b, 0);

  if (totalWidth === 0 || totalWidth >= 100) {
    widthList.unshift(100 / (fieldConfigList.length + 1));
  } else {
    widthList.unshift(100 - totalWidth);
  }

  const fieldIndexMap: Map<string, number> = new Map();
  if (data.series.length > 0) {
    let frame = data.series[0];
    for (let i = 0; i < frame.fields.length; i++) {
      fieldIndexMap.set(frame.fields[i].name!, i);
    }
  }

  return (
    <div
      className={cx(
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      <ThemeProvider theme={darkTheme}>
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <colgroup>
              {widthList.map(width => (
                <col style={{ width: width + '%' }} />
              ))}
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell align="center">PV Name</TableCell>
                {fieldConfigList.map(field => (
                  <TableCell align="center">{field['name']}</TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {data.series.map(dataFrame => (
                <TableRow key={dataFrame.refId}>
                  <TableCell align="center"> {dataFrame.refId} </TableCell>
                  {fieldConfigList.map(field => (
                    <TableCell
                      align="right"
                      className={getLastValue(dataFrame, 'alarm_severity', fieldIndexMap).toLowerCase()}
                    >
                      {getLastValue(dataFrame, field, fieldIndexMap)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </ThemeProvider>
    </div>
  );
};

function getLastValue(dataFrame: DataFrame, field: any, fieldIndexMap: Map<string, number>): any {
  let fieldName = '';
  let precision = NaN;

  if (typeof field === 'string') {
    fieldName = field;
  } else {
    fieldName = field['name']!;
    precision = Number(field['precision']);
  }

  let index = Number(fieldIndexMap.get(fieldName.trim()));
  const list = dataFrame.fields[index].values;

  if (list && list.length > 0) {
    let val = list.get(list.length - 1);
    let numVal = Number(val);

    if (!isNaN(numVal) && !isNaN(precision)) {
      return Number(numVal.toFixed(precision));
    }

    return val;
  }

  return {};
}
