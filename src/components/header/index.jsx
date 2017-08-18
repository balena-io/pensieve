import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import styled from 'styled-components';
import { Button } from 'rebass';
import { connect } from 'react-redux';
import store from '../../store';

const BlackBox = styled.div`
  height: 60px;
  background-color: #000000;
  position: relative;
`;

const Title = styled.h1`
  margin: 0;
  position: absolute;
  left: 30px;
  top: 15px;
  font-weight: 200;
  font-size: 24px;
  letter-spacing: 0.4px;
  color: #ffffff;
`;

const LogoutButton = styled(Button)`
position: absolute;
right: 30px;
top: 15px;
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
        <Title>
          {this.props.config.repo.name}
        </Title>
        <LogoutButton onClick={logout} bg="white" color="red">
          <FontAwesome style={{ marginRight: 5 }} name="sign-out" />
          Logout
        </LogoutButton>
      </BlackBox>
    );
  }
}

const mapStatetoProps = state => ({
  config: state.config,
});

export default connect(mapStatetoProps)(Header);
