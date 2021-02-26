import defaults from 'lodash/defaults';

import './plugin.css';

import React, { ChangeEvent, PureComponent } from 'react';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './DataSource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onPointNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, point_name: event.target.value });
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { point_name } = query;

    return (
      <div className="gf-form" id="monica-query">
        <div className="form-field">
          <label className="gf-form-label width-8">Point Name</label>
          <input type="text" className="gf-form-input" value={point_name || ''} onChange={this.onPointNameChange} />
        </div>
      </div>
    );
  }
}
