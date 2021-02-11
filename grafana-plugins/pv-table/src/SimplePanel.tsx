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

  const fieldNames = options.pv_fields.split(',');

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
            <TableHead>
              <TableRow>
                <TableCell>PV Name</TableCell>
                {fieldNames.map(fieldName => (
                  <TableCell align="right">{fieldName}</TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {data.series.map(dataFrame => (
                <TableRow key={dataFrame.refId}>
                  <TableCell align="center"> {dataFrame.refId} </TableCell>
                  {fieldNames.map(fieldName => (
                    <TableCell
                      align="right"
                      className={getLastValue(dataFrame, 'alarm_severity', fieldIndexMap).toLowerCase()}
                    >
                      {getLastValue(dataFrame, fieldName, fieldIndexMap)}
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

function getLastValue(dataFrame: DataFrame, fieldName: string, fieldIndexMap: Map<string, number>): any {
  let index = Number(fieldIndexMap.get(fieldName.trim()));
  const list = dataFrame.fields[index].values;

  if (list && list.length > 0) {
    return list.get(list.length - 1);
  }

  return {};
}
