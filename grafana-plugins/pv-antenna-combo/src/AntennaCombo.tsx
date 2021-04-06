import React, { ChangeEvent } from 'react';
import './plugin.css';
import { PanelProps, DataFrame } from '@grafana/data';
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

interface Props extends PanelProps<SimpleOptions> {}

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

  let frame: any;
  let mask = '';
  let reason = '';
  let arrayState = '';
  let cmdPVName = '';
  let offlinePVName = '';

  for (frame of data.series) {
    let dataFrame: DataFrame = frame as DataFrame;

    if (dataFrame.refId === 'mask') {
      mask = getValue(dataFrame, 'Value', -1);
    }

    if (dataFrame['refId'] === 'reason') {
      reason = getValue(dataFrame, 'Value', -1);
      offlinePVName = getValue(dataFrame, 'name', -1);
    }

    if (dataFrame['refId'] === 'array') {
      arrayState = getValue(dataFrame, 'Value', -1);
      cmdPVName = getValue(dataFrame, 'name', -1);
    }
  }

  const [state, setState] = React.useState<{ reason: string; message: string | null }>({
    reason: reason,
    message: '',
  });

  function handleOfflineChange(event: ChangeEvent<{ name?: string; value: any }>) {
    let reason = event.target.value!;
    console.log('offlinePVName', offlinePVName);

    const dataSourceSrv: any = getDataSourceSrv();
    const dataSources = dataSourceSrv.datasources;
    const dataSource = dataSources[Object.keys(dataSources)[0]];
    dataSource.doWrite(offlinePVName, [reason]).then((response: any) => {
      const responseData = response.data;
      console.log('responseData', responseData);
      setState({
        ...state,
        ['reason']: responseData['data']['data'][0],
        ['message']: responseData['message'],
      });
    });
  }

  function handleReturnAction(event: ChangeEvent<HTMLButtonElement>) {
    const dataSourceSrv: any = getDataSourceSrv();
    const dataSources = dataSourceSrv.datasources;
    const dataSource = dataSources[Object.keys(dataSources)[0]];
    dataSource.doWrite(cmdPVName, ['PENDING']).then((response: any) => {
      const responseData = response.data;
      console.log('responseData', responseData);
      setState({
        ...state,
        ['message']: responseData['message'],
      });
    });
  }

  function handleReturnImmdiatelyAction(event: ChangeEvent<HTMLButtonElement>) {}

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
        <div className="antenna-select-combo">
          <div>
            <Button
              size="small"
              disableElevation
              className={['antenna-state', getStateClassName(arrayState).toLowerCase()].join(' ')}
            >
              ma03
            </Button>
            <div className={['squares', getStateClassName(arrayState).toLowerCase()].join(' ')}>
              <div className={getMaskClassName(mask, 1)}></div>
              <div className={getMaskClassName(mask, 2)}></div>
              <div className={getMaskClassName(mask, 4)}></div>
              <div className={getMaskClassName(mask, 8)}></div>
            </div>
          </div>

          <FormControl className="select-offline-reason">
            <InputLabel id="select-offline-reason-label">Offline reason</InputLabel>
            <Select labelId="select-offline-reason-label" value={state.reason} onChange={handleOfflineChange}>
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
            <Button onChange={handleReturnAction}>Return</Button>
            <Button onChange={handleReturnImmdiatelyAction}>Return Now</Button>
          </ButtonGroup>
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
      const list = field.values;
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

function getMaskClassName(value: string, bitMask: number): string {
  let numVal = Number(value);
  if (!isNaN(numVal)) {
    return (numVal & bitMask) > 0 ? 'on' : 'off';
  }

  return 'off';
}

function getStateClassName(value: string): string {
  return value === 'IN' ? 'on' : 'off';
}
