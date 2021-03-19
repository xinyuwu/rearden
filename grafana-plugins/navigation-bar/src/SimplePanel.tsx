import React from 'react';
import './plugin.css';

import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory } from '@grafana/ui';

import { getLocationSrv } from '@grafana/runtime';

import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const styles = getStyles();

  async function changeVariable() {
    getLocationSrv().update({
      query: {
        'var-xVar': '36m',
      },
      partial: true,
      replace: true,
    });
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
      <Grid className="navigation_bar" container spacing={3}>
        <Grid container item spacing={1} alignItems="center">
          <Grid item xs>
            <label className="nav_title">Health</label>
          </Grid>
          <Grid item xs>
            <Chip className="nav_item" label="OK" onClick={changeVariable} />
          </Grid>
        </Grid>
        <Grid container item spacing={1} alignItems="center">
          <Grid item xs>
            <label className="nav_title">Config</label>
          </Grid>
          <Grid item xs>
            <Chip className="nav_item" label="OK" onClick={changeVariable} />
          </Grid>
        </Grid>
      </Grid>
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
