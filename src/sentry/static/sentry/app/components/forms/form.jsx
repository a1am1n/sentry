import React from 'react';

import IndicatorStore from '../../stores/indicatorStore';
import {t} from '../../locale';

import FormState from './state';

const Form = React.createClass({
  propTypes: {
    onSubmit: React.PropTypes.func.isRequired,
    submitDisabled: React.PropTypes.bool,
    submitLabel: React.PropTypes.string.isRequired,
    footerClass: React.PropTypes.string,
    footer: React.PropTypes.bool,
    initial: React.PropTypes.object,
  },

  getDefaultProps() {
    return {
      submitLabel: t('Save Changes'),
      submitDisabled: false,
      footer: true,
      footerClass: 'form-actions align-right',
      initial: {},
    };
  },

  getInitialState() {
    return {
      formState: new FormState({
        initial: this.props.initial,
      }),
    };
  },

  getChildContext() {
    return {
      formState: this.state.formState,
    };
  },

  componentWillReceiveProps(nextProps) {
    // TODO(dcramer): handle changing of initial data
  },

  onSubmit(e) {
    e.preventDefault();
    this.state.formState.save((data, success, failure) => {
      let loadingIndicator = IndicatorStore.add(t('Saving changes..'));
      this.forceUpdate(() => {
        let newSuccess = (...args) => {
          IndicatorStore.remove(loadingIndicator);
          success(...args);
        };

        let newFailure = (...args) => {
          IndicatorStore.remove(loadingIndicator);
          IndicatorStore.add(t('Unable to save changes. Please try again.'), 'error', {
            duration: 3000
          });
          failure(...args);
        };
        this.props.onSubmit(data, newSuccess, newFailure);
      });
    });
  },

  render() {
    let formState = this.state.formState;
    let submitDisabled = (
      this.props.submitDisabled || formState.isSaving() || !formState.hasChanges()
    );

    return (
      <form onSubmit={this.onSubmit}>
        {this.props.children}
        {this.props.footer &&
          <div className={this.props.footerClass} style={{marginTop: 25}}>
            <button className="btn btn-primary"
                    disabled={submitDisabled}
                    type="submit">{this.props.submitLabel}</button>
          </div>
        }
      </form>
    );
  }
});

export default Form;
