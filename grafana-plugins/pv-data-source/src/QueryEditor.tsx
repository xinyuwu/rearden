import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './DataSource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';

const { FormField } = LegacyForms;

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onPvNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, pv_name: event.target.value });
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { pv_name } = query;

    return (
      <div className="gf-form">
        <FormField labelWidth={8} value={pv_name || ''} onChange={this.onPvNameChange} label="PV Name" />
      </div>
    );
  }
}
