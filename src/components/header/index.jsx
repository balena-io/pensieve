import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import styled from 'styled-components';
import { Button, Flex } from 'rebass';
import { connect } from 'react-redux';
import { Container } from '../shared';
import store from '../../store';

const BlackBox = styled.div`
  height: 60px;
  background-color: #000000;
  position: relative;
`;

const Title = styled.h1`
  margin: 0;
  font-weight: 200;
  font-size: 24px;
  letter-spacing: 0.4px;
  color: #ffffff;
`;

const logout = () => {
  store.dispatch({ type: 'LOGOUT' });
  localStorage.clear();
  window.location.reload();
};

class Header extends Component {
  render() {
    return (
      <BlackBox>
        <Container>
          <Flex pt={15} justify="space-between">
            <Title>
              {this.props.config.repo.name}
            </Title>
            <Button onClick={logout} bg="white" color="red">
              <FontAwesome style={{ marginRight: 5 }} name="sign-out" />
              Logout
            </Button>
          </Flex>
        </Container>
      </BlackBox>
    );
  }
}

const mapStatetoProps = state => ({
  config: state.config,
});

export default connect(mapStatetoProps)(Header);
