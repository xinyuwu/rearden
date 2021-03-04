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

import * as d3 from 'd3';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const darkTheme = createMuiTheme({
    palette: {
      type: 'dark',
    },
  });
  const format = d3.utcFormat('%Y-%m-%dT%H:%M:%S');

  let timestampList: Date[] = [];
  const fieldIndexMap: Map<string, number> = new Map();
  if (data.series.length > 0) {
    let frame = data.series[0];
    for (let i = 0; i < frame.fields.length; i++) {
      fieldIndexMap.set(frame.fields[i].name!, i);
      if (frame.fields[i].name === 'Time') {
        timestampList = frame.fields[i].values.toArray();
      }
    }
  }

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
      <ThemeProvider theme={darkTheme}>
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Timestamp</TableCell>
                {data.series.map(dataFrame => (
                  <TableCell align="center">{dataFrame.refId}</TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {timestampList.map((timestamp: Date, index: number) => (
                <TableRow key={index.toString()}>
                  <TableCell align="center">{format(timestamp)}</TableCell>
                  {data.series.map(frame => (
                    <TableCell
                      align="right"
                      className={getValue(frame, 'alarm_severity', fieldIndexMap, index).toLowerCase()}
                    >
                      {getValue(frame, 'Value', fieldIndexMap, index)}
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

function getValue(dataFrame: DataFrame, fieldName: string, fieldIndexMap: Map<string, number>, index: number): any {
  let fieldIndex = Number(fieldIndexMap.get(fieldName.trim()));
  const list = dataFrame.fields[fieldIndex].values;

  if (list && list.length > index) {
    let val = list.get(index);
    let numVal = Number(val);

    if (!isNaN(numVal)) {
      return Number(numVal.toFixed(2));
    }

    return val;
  }

  return '';
}
