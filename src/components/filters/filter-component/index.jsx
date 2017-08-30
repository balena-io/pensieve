import React, { Component } from 'react';
import { Input, Select, Flex } from 'rebass';
import _ from 'lodash';
import styled from 'styled-components';
import FontAwesome from 'react-fontawesome';
import FilterSummary from './summary';
import ViewsMenu from './views-menu';
import ResinBtn from '../../shared/resin-button';
import { Modal } from '../../shared';
import * as util from '../../../util';
import SchemaSieve from '../../../services/filter';

const sieve = SchemaSieve();

const SimpleSearchBox = styled.div`
  position: relative;
  width: 500px;
  border-bottom: 2px solid #ccc;
  padding-left: 20px;
  padding-top: 3px;
  margin-left: 30px;
  margin-right: 30px;

  .search-icon {
    position: absolute;
    top: 7px;
    left: 0;
    color: #9b9b9b;
  }

  ${Input} {
    box-shadow: none;
    ::-webkit-input-placeholder {
      font-style: italic;
      color: #9b9b9b;
    }
    :-moz-placeholder {
      font-style: italic;
      color: #9b9b9b;
    }
    ::-moz-placeholder {
      font-style: italic;
      color: #9b9b9b;
    }
    :-ms-input-placeholder {
      font-style: italic;
      color: #9b9b9b;
    }
  }
`;

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

class Filters extends Component {
  constructor(props) {
    super(props);
    this.toggleModal = this.toggleModal.bind(this);
    this.handleEditChange = this.handleEditChange.bind(this);
    this.generateFreshEdit = this.generateFreshEdit.bind(this);

    const { rules } = this.props;
    const existingRule = _.find(rules, { name: sieve.SIMPLE_SEARCH_NAME });

    this.state = {
      showModal: false,
      edit: this.generateFreshEdit(),
      searchString: (existingRule && existingRule.value) || '',
    };
  }

  componentWillReceiveProps(nextProps) {
    const currentRules = nextProps.rules;
    const existing = _.find(currentRules, { name: sieve.SIMPLE_SEARCH_NAME });
    if (existing) {
      const { value } = existing;
      if (value !== this.state.searchString) {
        this.setState({ searchString: value });
      }
    } else {
      this.setState({ searchString: '' });
    }
  }

  generateFreshEdit() {
    if (!this.props.schema) {
      return {};
    }
    const inputModels = sieve.makeFilterInputs(this.props.schema);

    const edit = {
      name: Object.keys(inputModels).shift(),
      value: '',
    };

    edit.operator = inputModels[edit.name].availableOperators[0];

    return edit;
  }

  addFilterRule(rule) {
    const { rules } = this.props;
    rules.push(rule);
    this.props.setRules(rules);
  }

  editFilterRule(rule) {
    const { rules } = this.props;
    const updatedRules = rules.map(r => (r.id === rule ? rule : r));

    this.props.setRules(updatedRules);
  }

  addRule(rule) {
    const inputModels = sieve.makeFilterInputs(this.props.schema);

    if (!rule) {
      rule = _.cloneDeep(this.state.edit);
    }
    const baseRule = inputModels[rule.name];
    const newRule = _.assign(_.cloneDeep(baseRule), rule);

    if (newRule.id) {
      this.editFilterRule(newRule);
    } else {
      newRule.id = util.randomString();
      this.addFilterRule(newRule);
    }
    this.setState({
      showModal: false,
      edit: this.generateFreshEdit(),
    });
  }

  updateSimpleSearch(val) {
    this.setState({ searchString: val });
    const { rules } = this.props;
    const existingRule = _.find(rules, { name: sieve.SIMPLE_SEARCH_NAME });
    if (existingRule) {
      existingRule.value = val;
      this.editFilterRule(existingRule);
    } else {
      this.addFilterRule({
        name: sieve.SIMPLE_SEARCH_NAME,
        value: val,
        id: util.randomString(),
      });
    }
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

  removeRule(rule) {
    if (rule.name === sieve.SIMPLE_SEARCH_NAME) {
      this.setState({ searchString: '' });
    }

    const { rules } = this.props;

    const updatedRules = rules.filter(r => r.id !== rule.id);
    this.props.setRules(updatedRules);
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

  saveView(name, scope) {
    const { rules, user } = this.props;
    let { views } = this.props;

    const newView = {
      name,
      rules,
      id: util.randomString(),
      scope,
    };

    if (!views) {
      views = {};
    }

    if (scope === 'global') {
      if (!views.global) {
        views.global = [];
      }
      views[scope].push(newView);
    } else {
      if (!views[scope]) {
        views[scope] = {};
      }
      if (!views[scope][user.login]) {
        views[scope][user.login] = [];
      }
      views[scope][user.login].push(newView);
    }

    this.props.setViews(views);
  }

  deleteView(view) {
    const { views, user } = this.props;

    if (view.scope === 'global') {
      views.global = views.global.filter(item => item.id !== view.id);
    } else {
      views[view.scope][user.login] = views[view.scope][user.login].filter(
        item => item.id !== view.id,
      );
    }

    this.props.setViews(views);
  }

  render() {
    const inputModels = sieve.makeFilterInputs(this.props.schema);

    return (
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Flex justify="space-between">
          <ResinBtn onClick={() => this.toggleModal()}>
            <FontAwesome style={{ marginRight: 10 }} name="filter" />
            Add filter
          </ResinBtn>

          <SimpleSearchBox>
            <Input
              placeholder="Search entries..."
              value={this.state.searchString}
              onChange={e => this.updateSimpleSearch(e.target.value)}
            />
            <FontAwesome className="search-icon" name="search" />
          </SimpleSearchBox>

          <ViewsMenu
            rules={this.props.rules}
            views={this.props.views || []}
            user={this.props.user}
            setRules={this.props.setRules}
            deleteView={view => this.deleteView(view)}
          />
        </Flex>

        {this.state.showModal &&
          <div>
            <Modal
              title="Add a new filter"
              cancel={() => this.setState({ showModal: false })}
              done={() => this.addRule()}
              action={this.state.edit.id ? 'Update filter' : 'Add filter'}
            >
              <form onSubmit={e => e.preventDefault() && this.addRule()}>
                <Flex>
                  <Select
                    mr={20}
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
                    mr={20}
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
              </form>
            </Modal>
          </div>}

        {!!this.props.rules.length &&
          <FilterSummary
            edit={rule => this.showEditModal(rule)}
            delete={rule => this.removeRule(rule)}
            saveView={(name, scope) => this.saveView(name, scope)}
            rules={this.props.rules}
            views={this.props.views || {}}
          />}
      </div>
    );
  }
}

export default Filters;
