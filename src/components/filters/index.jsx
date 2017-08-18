import React, { Component } from 'react';
import { Input, Button, Select, Flex } from 'rebass';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import FilterSummary from './summary';
import ViewsMenu from './views-menu';
import store from '../../store';
import ResinBtn from '../shared/resin-button';
import { Modal } from '../shared';
import { updateUrl } from '../../services/path';

const _ = require('lodash');
const util = require('../../util');
const SchemaSieve = require('../../services/filter');

const sieve = SchemaSieve();

const addFilterRule = (rule) => {
  const { rules } = store.getState();
  rules.push(rule);
  store.dispatch({ type: 'SET_RULES', value: rules });

  updateUrl(rules);
};

const editFilterRule = (rule) => {
  const { rules } = store.getState();
  const updatedRules = rules.map(r => (r.hash === rule ? rule : r));

  store.dispatch({ type: 'SET_RULES', value: updatedRules });

  updateUrl(updatedRules);
};

const removeFilterRule = (rule) => {
  const { rules } = store.getState();

  const updatedRules = rules.filter(r => r.hash !== rule.hash);
  store.dispatch({ type: 'SET_RULES', value: updatedRules });

  updateUrl(updatedRules);
};

const saveView = (name) => {
  const { rules, views } = store.getState();

  views.push({
    name,
    rules,
    id: util.randomString(),
  });

  store.dispatch({ type: 'SET_VIEWS', value: views });
};

const updateView = (id) => {
  const state = store.getState();
  const { rules } = state;
  let { views } = state;

  views = views.map((view) => {
    if (view.id === id) {
      view.rules = rules;
    }

    return view;
  });

  store.dispatch({ type: 'SET_VIEWS', value: views });
};

const deleteView = ({ id }) => {
  let { views } = store.getState();

  views = views.filter(view => view.id !== id);

  store.dispatch({ type: 'SET_VIEWS', value: views });
};

const FilterInput = (props) => {
  if (props.type === 'string' || props.type === 'semver' || props.type === 'semver-range') {
    return <Input value={props.value} onChange={props.onChange} />;
  }
  if (props.type === 'number') {
    return <Input type="number" value={props.value} onChange={props.onChange} />;
  }
  if (props.type === 'boolean') {
    return null;
  }
  if (props.type === 'date') {
    return <Input type="date" value={props.value} onChange={props.onChange} />;
  }

  return <Input value={props.value} onChange={props.onChange} />;
};

FilterInput.propTypes = {
  type: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Date),
  ]).isRequired,
  onChange: PropTypes.func.isRequired,
};

class Filters extends Component {
  constructor(props) {
    super(props);
    this.toggleModal = this.toggleModal.bind(this);
    this.handleEditChange = this.handleEditChange.bind(this);
    this.generateFreshEdit = this.generateFreshEdit.bind(this);

    this.state = {
      showModal: false,
      edit: this.generateFreshEdit(),
    };
  }
  generateFreshEdit() {
    if (!this.props.schema) {
      return {};
    }
    const inputModels = sieve.makeFilterInputs(this.props.schema);

    const edit = {
      name: Object.keys(inputModels).shift(),
      value: '',
      id: util.randomString(),
    };

    edit.operator = inputModels[edit.name].availableOperators[0];

    return edit;
  }

  addRule(rule) {
    const inputModels = sieve.makeFilterInputs(this.props.schema);

    if (!rule) {
      rule = _.cloneDeep(this.state.edit);
    }
    const baseRule = inputModels[rule.name];
    const newRule = _.assign(_.cloneDeep(baseRule), rule);

    if (newRule.hash) {
      editFilterRule(newRule);
    } else {
      newRule.hash = util.randomString();
      addFilterRule(newRule);
    }
    this.setState({
      showModal: false,
      edit: this.generateFreshEdit(),
    });
  }

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  showEditModal(rule) {
    this.setState({
      showModal: true,
      edit: rule,
    });
  }

  handleEditChange(e, attribute) {
    const update = this.state.edit;
    const value = e.target.value;
    const inputModels = sieve.makeFilterInputs(this.props.schema);

    if (attribute === 'name' && update.name !== value) {
      update.name = e.target.value;
      update.operator = inputModels[value].availableOperators[0];
      update.value = '';
    } else {
      update[attribute] = e.target.value;
    }

    this.setState({ edit: update });
  }

  render() {
    const inputModels = sieve.makeFilterInputs(this.props.schema);

    return (
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <ResinBtn onClick={() => this.toggleModal()}>
          <FontAwesome style={{ marginRight: 10 }} name="filter" />
          Add filter
        </ResinBtn>

        {this.state.showModal &&
          <div>
            <Modal cancel={() => this.setState({ showModal: false })}>
              <form onSubmit={e => e.preventDefault() && this.addRule()}>
                <Flex>
                  <Select
                    value={this.state.edit.name}
                    onChange={e => this.handleEditChange(e, 'name')}
                  >
                    {_.map(inputModels, ({ name }) =>
                      (<option>
                        {name}
                      </option>),
                    )}
                  </Select>
                  <Select
                    value={this.state.edit.operator}
                    onChange={e => this.handleEditChange(e, 'operator')}
                  >
                    {_.map(inputModels[this.state.edit.name].availableOperators, name =>
                      (<option>
                        {name}
                      </option>),
                    )}
                  </Select>
                  <FilterInput
                    value={this.state.edit.value}
                    onChange={e => this.handleEditChange(e, 'value')}
                    type={inputModels[this.state.edit.name].type}
                  />
                </Flex>
                <Button style={{ marginTop: 15 }} onClick={() => this.addRule()}>
                  {this.state.edit.hash ? 'Update filter' : 'Add filter'}
                </Button>
              </form>
            </Modal>
          </div>}

        {!!this.props.rules.length &&
          <FilterSummary
            edit={rule => this.showEditModal(rule)}
            delete={rule => removeFilterRule(rule)}
            saveView={name => saveView(name)}
            updateView={id => updateView(id)}
          />}

        <ViewsMenu deleteView={view => deleteView(view)} />
      </div>
    );
  }
}

Filters.propTypes = {
  schema: PropTypes.object.isRequired,
  rules: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.string,
        PropTypes.number,
        PropTypes.instanceOf(Date),
      ]),
      operator: PropTypes.string,
    }),
  ).isRequired,
};

const mapStatetoProps = ({ rules, schema }) => ({
  rules,
  schema,
});

export default connect(mapStatetoProps)(Filters);
