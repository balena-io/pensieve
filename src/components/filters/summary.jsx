import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Radio, Label, ButtonTransparent, Flex, Input, Select, Button, Divider } from 'rebass';
import FontAwesome from 'react-fontawesome';
import { Modal } from '../shared';

const BorderedDiv = styled.div`
  margin-top: 10px;
  padding: 6px 11px;
  border: solid 1px #979797;
`;

const ActionBtn = styled.button`
  border: 0;
  background: none;
  padding: 0;
  font-size: inherit;
  float: right;
`;

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

  handleOptionChange(e) {
    this.setState({ option: e.target.value });
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

    if (id) {
      this.props.updateView(id);
    } else {
      this.props.saveView(name);
    }

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
        {this.state.showForm &&
          <Modal cancel={() => this.setState({ showForm: false })}>
            {!!this.props.views.length &&
              <radiogroup>
                <Label>
                  <Radio
                    name="radio"
                    value="new"
                    checked={this.state.option === 'new'}
                    onChange={e => this.handleOptionChange(e)}
                  />
                  Create a new view
                </Label>
                <Label>
                  <Radio
                    name="radio"
                    value="overwrite"
                    checked={this.state.option === 'overwrite'}
                    onChange={e => this.handleOptionChange(e)}
                  />
                  Overwrite existing view
                </Label>
              </radiogroup>}
            {!!this.props.views.length && <Divider />}
            {this.state.option === 'overwrite' &&
              <Select value={this.state.id} onChange={e => this.setExistingId(e)}>
                <option disabled value="">
                  Select a view to overwrite
                </option>
                {this.props.views.map(view =>
                  (<option value={view.id}>
                    {view.name}
                  </option>),
                )}
              </Select>}
            {this.state.option === 'new' &&
              <Input
                value={this.state.name}
                placeholder="Enter a name for your new view"
                onChange={e => this.handleChange(e)}
              />}
            <Button mt={15} onClick={() => this.save()}>
              {this.state.option === 'new' ? 'Save new view' : 'Overwrite view'}
            </Button>
          </Modal>}
        {this.props.rules.map(rule =>
          (<Flex>
            <p style={{ marginRight: 5 }}>
              {rule.name} <strong>{rule.operator}</strong> <em>{rule.value}</em>
            </p>
            <ButtonTransparent onClick={() => this.props.edit(rule)}>edit</ButtonTransparent>
            <ButtonTransparent onClick={() => this.props.delete(rule)}>remove</ButtonTransparent>
          </Flex>),
        )}
      </BorderedDiv>
    );
  }
}

FilterSummary.propTypes = {
  edit: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
  updateView: PropTypes.func.isRequired,
  saveView: PropTypes.func.isRequired,
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
  views: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const mapStatetoProps = ({ rules, views }) => ({
  rules,
  views: views || [],
});

export default connect(mapStatetoProps)(FilterSummary);
