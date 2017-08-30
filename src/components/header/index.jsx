import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import styled from 'styled-components';
import { Button, Flex } from 'rebass';
import { connect } from 'react-redux';
import { Container } from '../shared';
import { actions } from '../../actions';

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

class Header extends Component {
  logout() {
    this.props.logout();
    localStorage.clear();
    window.location.reload();
  }

  render() {
    return (
      <BlackBox>
        <Container>
          <Flex pt={15} justify="space-between">
            <Title>
              {this.props.config.repo.name}
            </Title>
            {this.props.isLoggedIn &&
              <Button onClick={() => this.logout()} bg="white" color="red">
                <FontAwesome style={{ marginRight: 5 }} name="sign-out" />
                Logout
              </Button>}
          </Flex>
        </Container>
      </BlackBox>
    );
  }
}

const mapStatetoProps = state => ({
  config: state.config,
  isLoggedIn: state.isLoggedIn,
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(actions.logout()),
});

export default connect(mapStatetoProps, mapDispatchToProps)(Header);
