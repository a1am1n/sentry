import React from 'react';
import {Link} from 'react-router';

import ApiMixin from '../mixins/apiMixin';
import IndicatorStore from '../stores/indicatorStore';
import ListLink from '../components/listLink';
import LoadingError from '../components/loadingError';
import LoadingIndicator from '../components/loadingIndicator';
import RuleEditor from './ruleEditor';
import {t} from '../locale';

const ProjectAlertRuleDetails = React.createClass({
  mixins: [ApiMixin],

  getInitialState() {
    return {
      loadingData: true,
      loadingConfig: true,
      errorData: false,
      errorConfig: false,
      data: null,
      config: null,
    };
  },

  componentDidMount() {
    this.fetchData();
  },

  fetchData() {
    let {orgId, projectId, ruleId} = this.props.params;
    this.api.request(`/projects/${orgId}/${projectId}/rules/${ruleId}/`, {
      success: (data, _, jqXHR) => {
        this.setState({
          errorData: false,
          loadingData: false,
          data: data
        });
      },
      error: () => {
        this.setState({
          errorData: true,
          loadingData: false
        });
      }
    });

    this.api.request(`/projects/${orgId}/${projectId}/alerts/rules/config/`, {
      success: (data, _, jqXHR) => {
        this.setState({
          errorConfig: false,
          loadingConfig: false,
          config: data,
        });
      },
      error: () => {
        this.setState({
          errorConfig: true,
          loadingConfig: false
        });
      }
    });
  },

  renderBody() {
    let body;

    if (this.state.loadingData || this.state.loadingConfig)
      body = this.renderLoading();
    else if (this.state.errorData || this.state.errorConfig)
      body = <LoadingError onRetry={this.fetchData} />;
    else
      body = this.renderEditor();

    return body;
  },

  renderLoading() {
    return (
      <div className="box">
        <LoadingIndicator />
      </div>
    );
  },

  renderEditor() {
    let {orgId, projectId} = this.props.params;
    return (
      <RuleEditor
        rule={this.state.data}
        config={this.state.config}
        orgId={orgId}
        projectId={projectId} />
    );
  },

  render() {
    let {orgId, projectId} = this.props.params;
    return (
      <div>
        <Link to={`/${orgId}/${projectId}/settings/alerts/new/`}
              className="btn pull-right btn-primary btn-sm">
          <span className="icon-plus" />
          {t('New Alert Rule')}
        </Link>
        <h2>{t('Alerts')}</h2>

        <ul className="nav nav-tabs" style={{borderBottom: '1px solid #ddd'}}>
          <ListLink to={`/${orgId}/${projectId}/settings/alerts/`}
                    index={true}>{t('Settings')}</ListLink>
          <ListLink to={`/${orgId}/${projectId}/settings/alerts/rules/`}>{t('Rules')}</ListLink>
        </ul>

        {this.renderBody()}
      </div>
    );
  }
});

export default ProjectAlertRuleDetails;
