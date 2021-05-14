import React, { ChangeEvent } from 'react';
import './plugin.css';
import { PanelProps, DataFrame } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory } from '@grafana/ui';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { config, getDataSourceSrv } from '@grafana/runtime';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

interface Props extends PanelProps<SimpleOptions> {}

export const CardControlPanel: React.FC<Props> = ({ options, data, width, height }) => {
  const [dialogOption, setDialogOption] = React.useState({
    open: false,
    action: '',
    pvName: '',
  });

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
  let textClass = isDark ? 'dark-text' : 'light-text';

  let control_action = 'on';
  let [state, setState] = React.useState<{ control_action: string }>({
    control_action: control_action,
  });

  function handleClickOpenDialog(event: any, action: string, pvName: string) {
    setDialogOption({
      open: true,
      action: action,
      pvName: pvName,
    });
  }

  function handleCloseDialog(event: any, proceedAction: boolean) {
    let pvName = dialogOption.pvName;

    setDialogOption({
      open: false,
      action: '',
      pvName: '',
    });

    if (!proceedAction) {
      return;
    }

    handleAction(pvName, 1);
  }

  function handleControlChange(event: ChangeEvent<{ name?: string; value: any }>) {
    let action = event.target.value!;

    setState(action);
  }

  function handleAction(pvName: string, value: any) {
    let dataSourceSrv: any = getDataSourceSrv();
    let dataSources = dataSourceSrv.datasources;
    let dataSource = dataSources[Object.keys(dataSources)[0]];
    dataSource.doWrite(pvName, [value]).then((response: any) => {
      let responseData = response.data;
      console.log('responseData', responseData);
    });
  }

  console.log('card control panel');

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
      <Dialog
        open={dialogOption.open}
        onClose={e => handleCloseDialog(e, false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">PDU {dialogOption.action}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you want to {dialogOption.action} the PDU.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={e => handleCloseDialog(e, true)} color="primary">
            Yes
          </Button>
          <Button onClick={e => handleCloseDialog(e, false)} color="primary" autoFocus>
            No
          </Button>
        </DialogActions>
      </Dialog>

      <ThemeProvider theme={theme}>
        <div className="card-control-row">
          <FormControl className="card-control-select">
            <Select
              id="select-offline-reason-label"
              value={state.control_action}
              onChange={event => handleControlChange(event)}
              label="Age"
            >
              <MenuItem value="">
                <em></em>
              </MenuItem>
              <MenuItem value={'none'}>none</MenuItem>
              <MenuItem value={'on'}>on</MenuItem>
              <MenuItem value={'off'}>off</MenuItem>
              <MenuItem value={'reboot'}>reboot</MenuItem>
            </Select>
          </FormControl>

          <Button variant="contained">{getField(data.series, 'comms', 'Value') ? 'Disconnected' : 'Connected'}</Button>

          <Button variant="contained"
            onClick={e => handleClickOpenDialog(e, 'startup', getField(data.series, 'startup', 'name'))}>
            Startup
          </Button>
          <Button variant="contained"
            onClick={e => handleClickOpenDialog(e, 'Shutdown', getField(data.series, 'shutdown', 'name'))}
          >
            Shutdown
          </Button>

          <span
            className={['card-control-item', getField(data.series, 'state', 'alarm_severity').toLowerCase()].join(' ')}
          >
            {getField(data.series, 'state', 'Value')}
          </span>

          <LinearProgress
            variant="determinate"
            className="card-control-progress"
            value={Number(getField(data.series, 'progress', 'Value'))}
          />

          <span className={['card-control-item', textClass].join(' ')}>
            {getField(data.series, 'startup_status', 'Value')}
          </span>
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

function getField(dataSeries: DataFrame[], refId: string, fieldName: string): string {
  if (dataSeries === null) {
    return '';
  }

  for (let dataFrame of dataSeries) {
    if (dataFrame.refId === refId) {
      for (let field of dataFrame.fields) {
        if (field['name'] === fieldName) {
          if (isNaN(field.values.get(0)) && typeof field.values.get(0) === 'number') {
            return '';
          }

          return field.values.get(0).toString();
        }
      }
    }
  }

  return '';
}
