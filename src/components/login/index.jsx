import React, { Component } from 'react';
import { Input, Box, Heading } from 'rebass';
import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';
import Alerts from '../alerts';
import { ResinBtn, GreyDivider } from '../shared';
import * as GitHubService from '../../services/github';
import { actions } from '../../actions';
import * as NotificationService from '../../services/notifications';

class Login extends Component {
  constructor(props) {
    super(props);

    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');
    const token = localStorage.getItem('token');

    this.state = {
      username: username || '',
      password: password || '',
      token: token || '',
      loading: false,
      loginError: null,
      show2faForm: false,
    };

    this.login = this.login.bind(this);
    this.loginToken = this.loginToken.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggle2faForm = this.toggle2faForm.bind(this);

    if (token) {
      return this.loginToken();
    }

    if (username && password) {
      return this.login();
    }
  }

  toggle2faForm(show2faForm = true) {
    NotificationService.clear();
    this.setState({ show2faForm });
  }

  login(e) {
    if (e) {
      e.preventDefault();
    }

    const { username, password } = this.state;
    if (!username || !password) {
      return;
    }

    NotificationService.clear();

    GitHubService.login({ username, password })
      .then(() => {
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        this.props.setIsLoggedIn(true);
      })
      .catch((err) => {
        if (err.response.headers['x-github-otp']) {
          NotificationService.warning(
            'Oops! It looks like you have two factor authentication enabled on your account. Click the button below for information on how to login.',
          );
        } else {
          NotificationService.error('Incorrect username or password');
        }
      });
  }

  loginToken(e) {
    if (e) {
      e.preventDefault();
    }

    const { token } = this.state;
    if (!token) {
      return;
    }

    NotificationService.clear();

    GitHubService.login({ token })
      .then(() => {
        localStorage.setItem('token', token);
        this.props.setIsLoggedIn(true);
      })
      .catch((err) => {
        console.error(err);
        NotificationService.error('Incorrect API token');
      });
  }

  handleChange(e, attribute) {
    const update = {};
    update[attribute] = e.target.value;
    this.setState(update);
  }

  render() {
    if (this.state.loading) {
      return <FontAwesome spin name="cog" />;
    }
    if (this.state.show2faForm) {
      return (
        <Box mt={100} mr="auto" ml="auto" w={470}>
          <Heading>Login to GitHub</Heading>
          <Alerts />
          <Box>
            <p>
              If you have 2fa enabled on your github account, you will need to use a Personal API
              token to login to github.
            </p>
            <p>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://github.com/blog/1509-personal-api-tokens"
              >
                Click here
              </a>{' '}
              for more information about GitHub Personal API tokens.
            </p>
            <form onSubmit={this.loginToken}>
              <Input
                mb={3}
                placeholder="Personal access token"
                type="password"
                value={this.state.token}
                onChange={e => this.handleChange(e, 'token')}
              />
              <ResinBtn primary>Login</ResinBtn>
            </form>
            <GreyDivider />
            <p>Do you want to login using your username and password?</p>
            <ResinBtn onClick={() => this.toggle2faForm(false)}>Click here</ResinBtn>
          </Box>
        </Box>
      );
    }
    return (
      <Box mt={100} mr="auto" ml="auto" w={470}>
        <Heading mb={3}>Login to GitHub</Heading>
        <Alerts />
        <Box>
          <form onSubmit={this.login}>
            <Input
              mb={3}
              placeholder="username"
              value={this.state.username}
              onChange={e => this.handleChange(e, 'username')}
            />
            <Input
              mb={3}
              placeholder="password"
              type="password"
              value={this.state.password}
              onChange={e => this.handleChange(e, 'password')}
            />
            <ResinBtn primary>Login</ResinBtn>
          </form>
          <GreyDivider />
          <p>Do you use two factor authentication?</p>
          <ResinBtn onClick={this.toggle2faForm}>Click here</ResinBtn>
        </Box>
      </Box>
    );
  }
}

const mapStatetoProps = state => ({
  isLoggedIn: state.isLoggedIn,
});

const mapDispatchToProps = dispatch => ({
  setIsLoggedIn: () => dispatch(actions.setIsLoggedIn(true)),
});

export default connect(mapStatetoProps, mapDispatchToProps)(Login);
