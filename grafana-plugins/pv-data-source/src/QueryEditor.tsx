import defaults from 'lodash/defaults';
import './plugin.css';

import React, { ChangeEvent, PureComponent } from 'react';
import { QueryEditorProps } from '@grafana/data';
import { PVDataSource } from './PVDataSource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';

type Props = QueryEditorProps<PVDataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onPvNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, pv_name: event.target.value });
  };

  onRepeatVariable = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, repeat_variable: event.target.value });
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { pv_name, repeat_variable } = query;

    return (
      <div className="pv-query">
        <div className="gf-form-inline">
          <label className="gf-form-label width-8">PV Name</label>
          <input type="text" className="gf-form-input" value={pv_name || ''} onChange={this.onPvNameChange} />
        </div>
        <div className="gf-form-inline">
          <label className="gf-form-label width-8">Repeat Variable</label>
          <input
            type="text"
            className="gf-form-input"
            placeholder="optional"
            value={repeat_variable || ''}
            onChange={this.onRepeatVariable}
          />
        </div>
      </div>
    );
  }
}
