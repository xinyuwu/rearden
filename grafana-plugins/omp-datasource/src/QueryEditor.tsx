import defaults from 'lodash/defaults';
import './plugin.css';

import React, { ChangeEvent, PureComponent } from 'react';
import { QueryEditorProps } from '@grafana/data';
import { OMPDataSource } from './OMPDataSource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';

type Props = QueryEditorProps<OMPDataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onCommandChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, command: event.target.value });
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { command } = query;

    return (
      <div className="command-query">
        <div className="gf-form-inline">
          <label className="gf-form-label width-8">Command</label>
          <input type="text" className="gf-form-input" value={command || ''} onChange={this.onCommandChange} />
        </div>
      </div>
    );
  }
}
