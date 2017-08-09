import React, { Component } from 'react';

import {
  Fixed,
  Button,
  ButtonTransparent,
  Overlay,
  Heading,
  Input,
  Select,
  Flex,
} from 'rebass';
const _ = require('lodash');
const util = require('./util');
const SchemaSeive = require('./services/filter');
const seive = SchemaSeive();
const createHistory = require('history').createBrowserHistory;
const history = createHistory();
const qs = require('qs');

class FilterInput extends Component {
  render() {
    if (this.props.type === 'text') {
      return (<Input value={this.props.value} onChange={this.props.onChange} />);
    }
  }
}

class Rule extends Component {
  render() {
    return (
      <p>
      </p>
    );
  }
}

class Filters extends Component {
  constructor(props) {
    super(props);
    const inputModels = seive.makeFilterInputs(this.props.schema);

    this.toggleModal = this.toggleModal.bind(this);
    this.handleEditChange = this.handleEditChange.bind(this);
    this.addRule = this.addRule.bind(this);
    this.generateFreshEdit = this.generateFreshEdit.bind(this);

    this.state = {
      showModal: false,
      inputModels: inputModels,
      edit: this.generateFreshEdit(),
    };

    if (history.location.search) {
      const parsed = qs.parse(history.location.search.replace(/^\?/, ''));
      _.forEach(parsed, ({ n, o, v }) => {
        const rule = {
          name: n,
          operator: o,
          value: v
        };

        this.addRule(rule);
      });
    }


  }

  generateFreshEdit() {
    const inputModels = seive.makeFilterInputs(this.props.schema);

    const edit = {
      name: Object.keys(inputModels).shift(),
      value: '',
    };

    edit.operator = inputModels[edit.name].availableOperators[0];

    return edit;
  }

  addRule(rule) {
    if (!rule) {
      rule = _.cloneDeep(this.state.edit);
    }
    const baseRule = this.state.inputModels[rule.name];
    const newRule = _.assign(_.cloneDeep(baseRule), rule);

    if (newRule.hash) {
      this.props.editFilterRule(newRule);
    } else {
      newRule.hash = util.randomString();
      this.props.addFilterRule(newRule);
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
    let update = this.state.edit;
    let value = e.target.value;

    if (attribute === 'name' && update.name !== value) {
      update.name = e.target.value;
      update.operator = this.state.inputModels[value].availableOperators[0];
      update.value = '';
    } else {
      update[attribute] = e.target.value;
    }

    this.setState({ edit: update });
  }

  render() {
    return (
      <div className="filters">
        <Button
          children='Add filter'
          onClick={e => this.toggleModal()}
        />

        {this.state.showModal && (
          <div>
            <Fixed
              top
              right
              bottom
              left
              onClick={e => this.toggleModal()}
            />
            <Overlay className="filter-modal" w={600}>
              <form onSubmit={(e) => e.preventDefault() && this.addRule()}>
                <Flex>
                  <Select
                    value={this.state.edit.name}
                    onChange={(e) => this.handleEditChange(e, 'name')}>
                    {_.map(this.state.inputModels, ({ name }) => (<option>{name}</option>))}
                  </Select>
                  <Select
                    value={this.state.edit.operator}
                    onChange={(e) => this.handleEditChange(e, 'operator')}>
                    {_.map(this.state.inputModels[this.state.edit.name].availableOperators, (name) => (<option>{name}</option>))}
                  </Select>
                  <FilterInput
                    value={this.state.edit.value}
                    onChange={(e) => this.handleEditChange(e, 'value')}
                    type="text" />
                </Flex>
                <Button
                  style={{marginTop: 15}}
                  onClick={(e) => this.addRule()}
                  children={this.state.edit.hash ? 'Update filter' : 'Add filter'} />
              </form>
            </Overlay>
          </div>
        )}

        <div>
          {this.props.filterRules.map((rule) => (
            <Flex>
              <p style={{marginRight: 5}}>
                {rule.name} <strong>{rule.operator}</strong> <em>{rule.value}</em>
              </p>
              <ButtonTransparent onClick={() => this.showEditModal(rule)} children='edit' />
              <ButtonTransparent onClick={() => this.props.removeFilterRule(rule)} children='remove' />
            </Flex>
            ))}
        </div>
      </div>
    );
  }
}

export default Filters;
