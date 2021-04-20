import React from 'react';
import './plugin.css';
import { PanelProps, DataFrame } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { config } from '@grafana/runtime';

import * as pandas from 'pandas-js';

import Tooltip from '@material-ui/core/Tooltip';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import * as d3 from 'd3';

interface Props extends PanelProps<SimpleOptions> {}

export const PVHistoryTable: React.FC<Props> = ({ options, data, width, height }) => {
  console.log('PVHistoryTable');

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

  const format = d3.utcFormat('%Y-%m-%dT%H:%M:%S');

  let dataFrame: pandas.DataFrame;
  for (let series of data.series) {
    let frame = seriesToDataframe(series);
    if (dataFrame) {
      if (frame) {
        dataFrame = dataFrame.merge(frame, ['Time'], 'outer');
      }
    } else {
      dataFrame = frame;
    }
  }

  let timestampList = dataFrame
    .get('Time')
    .sort_values()
    .index.toList();

  let colWidth = 100 / (data.series.length + 1);

  return (
    <div
      id="pv-history-table-div"
      className={cx(
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      <ThemeProvider theme={theme}>
        <TableContainer component={Paper} id="table-container">
          <Table stickyHeader aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center" style={{ width: colWidth + '%' }}>
                  Timestamp (UTC)
                </TableCell>
                {data.series.map(dataFrame => (
                  <Tooltip title={dataFrame.name!} placement="top">
                    <TableCell align="center" style={{ width: colWidth + '%' }}>
                      {dataFrame['refId']}
                    </TableCell>
                  </Tooltip>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {timestampList.map((actual_index: number, index: number) => (
                <TableRow key={index.toString()}>
                  <TableCell align="center">{format(getValue(dataFrame, '', 'Time', actual_index))}</TableCell>
                  {data.series.map(frame => (
                    <Tooltip title={getValue(dataFrame, frame.name, 'raw_value', actual_index)} placement="top">
                      <TableCell
                        align="right"
                        className={getValue(dataFrame, frame.name, 'alarm_severity', actual_index).toLowerCase()}
                      >
                        {getValue(dataFrame, frame.name, 'Value', actual_index)}
                      </TableCell>
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

function getValue(dataFrame: pandas.DataFrame, frameName: string, fieldName: string, index: number): any {
  let columnName = fieldName;
  if (frameName) {
    columnName = frameName + '-' + fieldName;
  }

  if (!dataFrame.columnExists(columnName)) {
    return '';
  }

  let series = dataFrame.get(columnName);
  let val: any;

  if (series) {
    val = dataFrame.get(columnName).values.get(index);
  } else {
    val = '';
  }

  if (val !== null) {
    let numVal = Number(val);
    if (!isNaN(numVal)) {
      return Number(numVal.toFixed(2));
    }

    return val;
  }

  return '';
}

function seriesToDataframe(frame: DataFrame): pandas.DataFrame[] {
  let data = [];

  let lastTime: Number = 0;

  for (let i = 0; i < frame.fields[0].values.length; i++) {
    let obj = {};

    for (let field of frame.fields) {
      if (field.name === 'Time') {
        // get rid of second component
        let val = field.values.get(i);
        val.setMilliseconds(0);
        val.setSeconds(0);
        if (lastTime > 0) {
          if (val.getTime() === lastTime) {
            break;
          }
        }
        obj['Time'] = val.getTime();
        lastTime = val.getTime();
      } else {
        let name = frame.name + '-' + field.name;
        obj[name] = field.values.get(i);
      }
    }

    if (Object.keys(obj).length > 0) {
      data.push(obj);
    }
  }

  if (data.length > 0) {
    let dataFrame = new pandas.DataFrame(data);
    return dataFrame;
  }

  return null;

  // for (let field of frame.fields) {
  //   if (field.name === 'Time') {
  //     data.set(field.name, new pandas.Series(field.values.toArray(),
  //                                             {name: field.name}));
  //     columns.push(field.name);
  //   } else {
  //     let name = frame.name + '-' + field.name
  //     data.set(name,
  //             new pandas.Series(field.values.toArray(), {name: name}));
  //     columns.push(name);
  //   }
  // }
  //
  // let dataFrame = new pandas.DataFrame(data, columns);
  // return dataFrame;
}
