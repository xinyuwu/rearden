import React, { ChangeEvent, PureComponent } from 'react';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions } from './types';
import './plugin.css';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
  onPathChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      path: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  // Secure field (only sent to the backend)
  onAPIKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      apiKey: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  onResetAPIKey = () => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      apiKey: '',
    };
    onOptionsChange({ ...options, jsonData });
  };

  render() {
    const { options } = this.props;
    const jsonData = options.jsonData;

    return (
      <div className="gf-form-group monica-query">
        <div className="gf-form">
          <div className="form-field">
            <label className="gf-form-label width-10">Path to backend server</label>
            <input
              type="text"
              className="gf-form-input"
              value={jsonData.path || 'http://localhost:8080/monica/points'}
              onChange={this.onPathChange}
            />
          </div>
        </div>
      </div>
    );
  }
}
