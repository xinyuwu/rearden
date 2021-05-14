import React, { ChangeEvent, FormEvent } from 'react';
import './plugin.css';
import { PanelProps, DataFrame, VariableModel } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory } from '@grafana/ui';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { config, getDataSourceSrv } from '@grafana/runtime';
import { getTemplateSrv } from '@grafana/runtime';

interface Props extends PanelProps<SimpleOptions> {}

interface ExtendedVariableModel extends VariableModel {
  current: {
    selected: boolean;
    value: any;
    text: string;
  };
  options: any[];
}

export const AntennaCombo: React.FC<Props> = ({ options, data, width, height }) => {
  const styles = getStyles();

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

  console.log('pv combo');

  let count = 0;

  if (data.series.length > 0) {
    let dataFrame = data.series[0];
    count = dataFrame.length;
  }

  let frame: any;
  let reasons: string[] = [];
  let cmdPVNames: string[] = [];
  let offlinePVNames: string[] = [];

  for (frame of data.series) {
    let dataFrame: DataFrame = frame as DataFrame;

    if (dataFrame['refId'] === 'command') {
      for (let field of dataFrame['fields']) {
        if (field['name'] === 'name') {
          let list = field.values;
          for (let i = 0; i < list.length; i++) {
            let val = list.get(i);
            cmdPVNames.push(val);
          }
        }
      }
    }

    if (dataFrame['refId'] === 'reason') {
      for (let field of dataFrame['fields']) {
        if (field['name'] === 'name') {
          let list = field.values;
          for (let i = 0; i < list.length; i++) {
            let val = list.get(i);
            offlinePVNames.push(val);
          }
        }
        if (field['name'] === 'Value') {
          let list = field.values;
          for (let i = 0; i < list.length; i++) {
            let val = list.get(i);
            reasons.push(val);
          }
        }
      }
    }
  }

  let [state, setState] = React.useState<{ reason: string[]; message: string | null }>({
    reason: reasons,
    message: message,
  });

  function handleOfflineChange(event: ChangeEvent<{ name?: string; value: any }>, index: number) {
    let reason = event.target.value!;

    console.log('offlinePVName', offlinePVNames[index]);

    let dataSourceSrv: any = getDataSourceSrv();
    let dataSources = dataSourceSrv.datasources;
    let dataSource = dataSources[Object.keys(dataSources)[0]];
    let oldReasons: string[] = state.reason;
    dataSource.doWrite(offlinePVNames[index], [reason]).then((response: any) => {
      let responseData = response.data;
      console.log('responseData', responseData);
      oldReasons[index] = responseData['data']['data'][0];
      setState({
        ...state,
        ['reason']: oldReasons,
        ['message']: responseData['message'],
      });
    });
  }

  function handleReturnAction(event: FormEvent<HTMLButtonElement>, index: number) {
    let dataSourceSrv: any = getDataSourceSrv();
    let dataSources = dataSourceSrv.datasources;
    let dataSource = dataSources[Object.keys(dataSources)[0]];
    dataSource.doWrite(cmdPVNames[index], ['PENDING']).then((response: any) => {
      let responseData = response.data;
      console.log('responseData', responseData);
      setState({
        ...state,
        ['message']: responseData['message'],
      });
    });
  }

  function handleReturnImmdiatelyAction(event: FormEvent<HTMLButtonElement>, index: number) {
    let dataSourceSrv: any = getDataSourceSrv();
    let dataSources = dataSourceSrv.datasources;
    let dataSource = dataSources[Object.keys(dataSources)[0]];
    dataSource.doWrite(cmdPVNames[index], ['IN']).then((response: any) => {
      let responseData = response.data;
      console.log('responseData', responseData);
      setState({
        ...state,
        ['message']: responseData['message'],
      });
    });
  }

  let variables = getTemplateSrv().getVariables() as ExtendedVariableModel[];
  let repeatVar: any[] = [];
  for (let variable of variables) {
    if (variable['name'] === 'antennas') {
      let value = variable['current']['value'];
      if (value.length === 1 && value[0] === '$__all') {
        repeatVar = variable['options']
          .map((option: any) => {
            if (option.value !== '$__all') {
              return option.value;
            }
            return '';
          })
          .filter(val => {
            return val !== '';
          });
      } else {
        repeatVar = variable['current']['value'];
      }
    }
  }

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
      <ThemeProvider theme={theme}>
        <div className="antenna-select">
          {Array(count)
            .fill(0)
            .map((_, index) => (
              <div className="antenna-select-combo">
                <div>
                  <Button
                    size="small"
                    disableElevation
                    className={['antenna-state', getStateClassName(data.series, index).toLowerCase()].join(' ')}
                  >
                    {repeatVar[index]!}
                  </Button>
                  <div className={['squares', getStateClassName(data.series, index).toLowerCase()].join(' ')}>
                    <div className={getMaskClassName(data.series, index, 1)}></div>
                    <div className={getMaskClassName(data.series, index, 2)}></div>
                    <div className={getMaskClassName(data.series, index, 4)}></div>
                    <div className={getMaskClassName(data.series, index, 8)}></div>
                  </div>
                </div>

                <FormControl className="select-offline-reason">
                  <InputLabel id="select-offline-reason-label">Offline reason</InputLabel>
                  <Select
                    labelId="select-offline-reason-label"
                    value={reasons[index]}
                    onChange={event => handleOfflineChange(event, index)}
                  >
                    <MenuItem value="">
                      <em></em>
                    </MenuItem>
                    <MenuItem value={'NOT INSTALLED'}>NOT INSTALLED</MenuItem>
                    <MenuItem value={'drives fault'}>drives fault</MenuItem>
                    <MenuItem value={'drives maintenence'}>drives maintenence</MenuItem>
                    <MenuItem value={'cooling fault'}>cooling fault</MenuItem>
                    <MenuItem value={'PAF maintenence'}>PAF maintenence</MenuItem>
                    <MenuItem value={'digital backend fault'}>digital backend fault</MenuItem>
                    <MenuItem value={'no beam weight'}>no beam weight</MenuItem>
                    <MenuItem value={'debugging/testing'}>debugging/testing</MenuItem>
                  </Select>
                </FormControl>

                <ButtonGroup variant="contained">
                  <Button onClick={event => handleReturnAction(event, index)}>Return</Button>
                  <Button onClick={event => handleReturnImmdiatelyAction(event, index)}>Return Now</Button>
                </ButtonGroup>
              </div>
            ))}
        </div>
      </ThemeProvider>
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

function getValue(dataFrame: DataFrame | null, fieldName: string, index: number): string {
  if (dataFrame === null) {
    return '';
  }

  for (let field of dataFrame.fields) {
    if (field['name'] === fieldName) {
      let list = field.values;
      if (list && list.length > 0) {
        if (index >= 0) {
          let val = list.get(index);
          return val!;
        } else {
          let val = list.get(list.length - 1);
          return val!;
        }
      }
    }
  }
  return '';
}

function getMaskClassName(dataSeries: any[], index: number, bitMask: number): string {
  let frame: any;
  let value = '';

  for (frame of dataSeries) {
    let dataFrame: DataFrame = frame as DataFrame;
    if (dataFrame.refId === 'mask') {
      value = getValue(dataFrame, 'Value', index);
    }
  }

  let numVal = Number(value);
  if (!isNaN(numVal)) {
    return (numVal & bitMask) > 0 ? 'on' : 'off';
  }

  return 'off';
}

function getStateClassName(dataSeries: any[], index: number): string {
  let frame: any;
  let value = '';
  for (frame of dataSeries) {
    let dataFrame: DataFrame = frame as DataFrame;
    if (dataFrame['refId'] === 'array') {
      value = getValue(dataFrame, 'Value', index);
    }
  }

  return value;
}
