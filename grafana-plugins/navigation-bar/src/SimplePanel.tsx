import React from 'react';
import './plugin.css';

import { PanelProps, DataFrame } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory } from '@grafana/ui';

import { getLocationSrv } from '@grafana/runtime';

import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const styles = getStyles();

  const var_name = options.var_name;
  const field_name = options.field_name;
  const field_mapping = new Map();

  for (let field of options.field_mapping) {
    if (field) {
      let res = field.split(':');
      if (res && res.length === 2) {
        field_mapping.set(res[0].trim(), res[1].trim());
      }
    }
  }

  function changeVariable(event: any, val: string) {
    let newVal = field_mapping.get(val);
    if (!newVal) {
      newVal = val.toLowerCase();
    }

    let query: any = {};
    query[var_name] = newVal;
    getLocationSrv().update({
      query: query,
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
      <Grid className="navigation_bar" container spacing={3} direction="column">
        {data.series.map(dataFrame => (
          <Grid container item spacing={1} alignItems="center" direction="row">
            <Grid item xs>
              <label className="nav_title">{dataFrame.refId}</label>
            </Grid>
            <Grid item xs>
              <Chip
                className={['nav_item', getValue(dataFrame, 'alarm_severity').toLowerCase()].join(' ')}
                label={getValue(dataFrame, field_name)}
                onClick={e => changeVariable(e, dataFrame.refId!)}
              />
            </Grid>
          </Grid>
        ))}
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

function getValue(dataFrame: DataFrame, fieldName: string): string {
  for (let field of dataFrame.fields) {
    if (field['name'] === fieldName) {
      const list = field.values;
      if (list && list.length > 0) {
        let val = list.get(list.length - 1);
        return val!;
      }
    }
  }
  return '';
}
