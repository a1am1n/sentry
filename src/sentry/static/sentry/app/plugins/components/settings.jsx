import React from 'react';

import {
  Form,
  FormState,
  NumberField,
  PasswordField,
  Select2Field,
  Select2FieldAutocomplete,
  TextField,
  TextareaField,
} from '../../components/forms';
import {Client} from '../../api';
import LoadingIndicator from '../../components/loadingIndicator';
import {defined} from '../../utils';

class FormField extends React.Component {
  render() {
    let state = this.props.state || this.context.formState;
    let config = this.props.config;
    let required = defined(config.required) ? config.required : true;
    let props = Object.assign(Object.assign({}, config), {
      value: state.data[config.name],
      onChange: state.onChangeField.bind(this, config.name),
      label: config.label + (required ? '*' : ''),
      placeholder: config.placeholder,
      required: required,
      name: config.name,
      error: state.errors[config.name],
      disabled: config.readonly,
      key: config.name,
      help: <span dangerouslySetInnerHTML={{__html: config.help}}/>
    });

    switch (config.type) {
      case 'secret':
        return <PasswordField {...props} />;
      case 'string':
      case 'text':
      case 'url':
        return <TextField {...props} />;
      case 'number':
        return <NumberField {...props} />;
      case 'textarea':
        return <TextareaField {...props} />;
      case 'choice':
      case 'select':
        if (props.has_autocomplete) {
          return <Select2FieldAutocomplete {...props} />;
        }
        return <Select2Field {...props} />;
      default:
        return null;
    }
  }
}

FormField.propTypes = {
    state: React.PropTypes.instanceOf(FormState).isRequired,
    config: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func,
};


class PluginSettings extends React.Component {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    this.fetchData = this.fetchData.bind(this);

    this.state = {
      fieldList: null,
      formState: new FormState(),
    };
  }

  getInitialState() {
    return {
      loading: true,
      error: false,
      initialData: {},
    };
  }

  componentWillMount() {
    this.api = new Client();
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillUnmount() {
    this.api.clear();
  }

  getPluginEndpoint() {
    let org = this.props.organization;
    let project = this.props.project;
    return (
      `/projects/${org.slug}/${project.slug}/plugins/${this.props.plugin.id}/`
    );
  }

  onSubmit(data, success, failure) {
    this.api.request(this.getPluginEndpoint(), {
      data: data,
      method: 'PUT',
      success: () => {
        success();
      },
      error: (error) => {
        failure((error.responseJSON || {}).errors);
      },
    });
  }

  fetchData() {
    this.api.request(this.getPluginEndpoint(), {
      success: (data) => {
        let formData = {};
        data.config.forEach((field) => {
          formData[field.name] = field.value || field.defaultValue;
        });
        this.setState({
          error: false,
          loading: false,
          initialData: formData,
          fieldList: data.config,
        });
      },
      error: (error) => {
        this.setState({
          error: true,
          loading: false,
        });
      }
    });
  }

  render() {
    if (!this.state.fieldList) {
      return <LoadingIndicator />;
    }
    return (
      <Form onSubmit={this.onSubmit} initial={this.state.initialData}>
        {this.state.fieldList.map(f => <FormField key={f.name} config={f} />)}
      </Form>
    );
  }
}

PluginSettings.propTypes = {
    organization: React.PropTypes.object.isRequired,
    project: React.PropTypes.object.isRequired,
    plugin: React.PropTypes.object.isRequired,
};

export default PluginSettings;
