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
import { config } from '@grafana/runtime';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
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

  const [state, setState] = React.useState<{ reason: string; selectCmd: string | null }>({
    reason: 'NOT INSTALLED',
    selectCmd: '',
  });

  function handleOfflineChange(event: ChangeEvent<{ name?: string; value: any }>) {
    setState({
      ...state,
      ['reason']: event.target.value!,
    });
  }

  function handleReturnAction(event: ChangeEvent<HTMLButtonElement>) {}

  function handleReturnImmdiatelyAction(event: ChangeEvent<HTMLButtonElement>) {}

  console.log('pv combo graph');

  let dataFrame: any = null;
  if (data.series.length > 0) {
    dataFrame = data.series[0];
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
        <div className="antenna-select-combo">
          <div>
            <Button size="small" className="antenna-state" disableElevation>
              ma01
            </Button>
            <div className="squares">
              <div className="on"></div>
              <div className="off"></div>
              <div className="off"></div>
              <div className="on"></div>
            </div>
          </div>

          <FormControl className="select-offline-reason">
            <InputLabel id="select-offline-reason-label">Offline reason</InputLabel>
            <Select labelId="select-offline-reason-label"
              value={state.reason} onChange={handleOfflineChange}>
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
        if (index>=0) {
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
