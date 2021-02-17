import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions } from './types';

const { SecretFormField, FormField } = LegacyForms;

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

  onResolutionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      resolution: parseFloat(event.target.value),
    };
    onOptionsChange({ ...options, jsonData });
  };

  render() {
    const { options } = this.props;
    const jsonData = options.jsonData;

    return (
      <div className="gf-form-group">
        <div className="gf-form">
          <FormField
            label="Path"
            labelWidth={6}
            inputWidth={20}
            onChange={this.onPathChange}
            value={jsonData.path || ''}
            placeholder="path to backend server"
          />
        </div>

        <div className="gf-form-inline">
          <div className="gf-form">
            <SecretFormField
              isConfigured={(jsonData && jsonData.apiKey !== '') as boolean}
              value={jsonData.apiKey || ''}
              label="API Key"
              placeholder="secure json field (backend only)"
              labelWidth={6}
              inputWidth={20}
              onReset={this.onResetAPIKey}
              onChange={this.onAPIKeyChange}
            />
          </div>
        </div>
        <div className="gf-form">
          <FormField
            label="Resolution"
            onChange={this.onResolutionChange}
            value={jsonData.resolution || ''}
            placeholder="Enter a number"
          />
        </div>
      </div>
    );
  }
}
