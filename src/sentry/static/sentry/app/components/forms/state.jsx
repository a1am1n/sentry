import underscore from 'underscore';

class FormState {
  constructor(options) {
    this.state = this.READY;
    this.errors = {};

    this.initial = Object.assign({}, options.initial || {});
    this.onChange = options.onUpdate || function() { };
    this.onSave = options.onSave || function() { };

    this.data = Object.assign({}, this.initial);

  }

  onChangeField(name, value) {
    this.data[name] = value;
    delete this.errors[name];
    this.onChange();
  }

  setState(state) {
    this.state = state;
  }

  isSaving() {
    return this.state === this.SAVING;
  }

  hasChanges() {
    return !underscore.isEqual(this.initial, this.data);
  }

  save(callback) {
    let curData = Object.assign({}, this.data);
    let success = () => {
      this.initial = Object.assign({}, curData);
      this.state = this.READY;
      this.errors = {};
      this.onSave(curData);
    };

    let failure = (errors) => {
      this.state = this.ERROR;
      this.errors = errors || {'__all__': 'Unknown error'};
    };

    this.state = this.SAVING;
    callback(curData, success, failure);
  }
}

FormState.LOADING = 'Loading';
FormState.READY = 'Ready';
FormState.SAVING = 'Saving';
FormState.ERROR = 'Error';

export default FormState;
