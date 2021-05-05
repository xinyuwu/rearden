import React from 'react';
import './plugin.css';
import { PanelProps, DataFrame } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { config } from '@grafana/runtime';

import Tooltip from '@material-ui/core/Tooltip';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import * as math from 'mathjs';

interface Props extends PanelProps<SimpleOptions> {}

export const PVTable: React.FC<Props> = ({ options, data, width, height }) => {
  console.log('PVTable');

  let isDark = config.theme.isDark;
  const darkTheme = createMuiTheme({
    palette: {
      type: 'dark',
    },
  });

  const lightTheme = createMuiTheme({
    palette: {
      type: 'light',
    },
  });

  let theme = isDark ? darkTheme : lightTheme;

  let fields = options.pv_fields;

  let fieldConfigList: any[] = [];

  let widthList: number[] = [];

  fields.forEach(text => {
    let field = JSON.parse(text);
    fieldConfigList.push(field);
    let widthStr = field['width'];
    let width = 0;

    if (String(widthStr).includes('/')) {
      let f = math.number(math.fraction(widthStr));
      widthStr = math.format(f, 2);
    }

    width = parseFloat(widthStr);
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

  let fieldIndexMap: Map<string, number> = new Map();
  if (data.series.length > 0) {
    let frame = data.series[0];
    for (let i = 0; i < frame.fields.length; i++) {
      fieldIndexMap.set(frame.fields[i].name!, i);
    }
  }

  return (
    <div
      id="pv-table-div"
      className={cx(
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      <ThemeProvider theme={theme}>
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
                  <TableCell align="center">{field['displayName'] ? field['displayName'] : field['name']}</TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {data.series.map(dataFrame => (
                <TableRow
                  key={dataFrame.name}
                  className={getLastValue(dataFrame, 'alarm_severity', fieldIndexMap).toLowerCase()}
                >
                  <Tooltip title={dataFrame.name!} placement="top">
                    <TableCell align="center" className="header_column">
                      {dataFrame['refId']}
                    </TableCell>
                  </Tooltip>
                  {fieldConfigList.map(field => (
                    <Tooltip title={getLastValue(dataFrame, 'raw_value', fieldIndexMap)} placement="top">
                      <TableCell align="right">{getLastValue(dataFrame, field, fieldIndexMap)}</TableCell>
                    </Tooltip>
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

  let fieldIndex = Number(fieldIndexMap.get(fieldName.trim()));
  if (isNaN(Number(fieldIndex))) {
    return '';
  }

  let list = dataFrame.fields[fieldIndex].values;

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
