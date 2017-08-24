import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Box, Text, Input, Flex } from 'rebass';
import FontAwesome from 'react-fontawesome';
import { Modal } from '../shared';
import FilterDescription from './filter-description';
import SchemaSieve from '../../services/filter';

const sieve = SchemaSieve();

const BorderedDiv = styled.div`
  margin-top: 10px;
  padding: 6px 11px 0;
  border: solid 1px #979797;
`;

const ActionBtn = styled.button`
  border: 0;
  background: none;
  padding: 0;
  font-size: 13px;
  float: right;
`;

const hashRule = rule => `${rule.name}::${rule.operator}::${rule.value}`;

class FilterSummary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      showForm: false,
      id: '',
      option: 'new',
    };
  }

  setExistingId(e) {
    const id = e.target.value;
    this.setState({ id });
  }

  handleChange(e) {
    const name = e.target.value;
    this.setState({ name });
  }

  save() {
    const { name, id } = this.state;

    if (!name && !id) {
      return;
    }

    this.props.saveView(name);

    this.setState({
      name: '',
      showForm: false,
      id: '',
    });
  }

  render() {
    return (
      <BorderedDiv>
        <ActionBtn onClick={() => this.setState({ showForm: !this.state.showForm })}>
          <FontAwesome name="bookmark-o" style={{ marginRight: 6 }} />
          Save view
        </ActionBtn>

        <Text fontSize={13} mb={10}>
          Filters ({this.props.rules.length})
        </Text>
        {this.state.showForm &&
          <Modal
            title="Save current view"
            cancel={() => this.setState({ showForm: false })}
            done={() => this.save()}
            action="Save"
          >
            <Input
              value={this.state.name}
              placeholder="Enter a name"
              onChange={e => this.handleChange(e)}
            />
          </Modal>}
        <Flex wrap>
          {this.props.rules.map(rule =>
            (<Box mb={10} mr={10} key={hashRule(rule)}>
              <FilterDescription
                rule={rule}
                edit={rule.name === sieve.SIMPLE_SEARCH_NAME ? false : () => this.props.edit(rule)}
                delete={() => this.props.delete(rule)}
              />
            </Box>),
          )}
        </Flex>
      </BorderedDiv>
    );
  }
}

const mapStatetoProps = ({ rules, views }) => ({
  rules,
  views: views || [],
});

export default connect(mapStatetoProps)(FilterSummary);
