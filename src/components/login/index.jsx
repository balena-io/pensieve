import React, { Component } from 'react';
import { Input, Box, Button, Text, Heading, Divider } from 'rebass';
import FontAwesome from 'react-fontawesome';
import * as GitHubService from '../../services/github';
import store from '../../store';

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
    this.setState({ show2faForm });
  }

  login(e) {
    if (e) {
      e.preventDefault();
    }

    this.setState({ loginError: null });

    const { username, password } = this.state;
    if (!username || !password) {
      return;
    }

    GitHubService.login({ username, password })
      .then(() => {
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        store.dispatch({ type: 'SET_IS_LOGGED_IN', value: true });
      })
      .catch((err) => {
        console.error(err);
        this.setState({
          loginError: 'Incorrect username or password',
        });
      });
  }

  loginToken(e) {
    if (e) {
      e.preventDefault();
    }
    this.setState({ loginError: null });

    const { token } = this.state;
    if (!token) {
      return;
    }

    GitHubService.login({ token })
      .then(() => {
        localStorage.setItem('token', token);
        store.dispatch({ type: 'SET_IS_LOGGED_IN', value: true });
      })
      .catch((err) => {
        console.error(err);
        this.setState({
          loginError: 'Incorrect username or password',
        });
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
          {this.state.loginError &&
            <Box>
              <Text color="red">
                {this.state.loginError}
              </Text>
            </Box>}
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
              <Button mb={4}>Login</Button>
            </form>
            <Divider color="#cccccc" />
            <p>Do you want to login using your username and password?</p>
            <Button onClick={() => this.toggle2faForm(false)}>Click here</Button>
          </Box>
        </Box>
      );
    }
    return (
      <Box mt={100} mr="auto" ml="auto" w={470}>
        <Heading mb={3}>Login to GitHub</Heading>
        {this.state.loginError &&
          <Box mb={3}>
            <Text color="red">
              {this.state.loginError}
            </Text>
          </Box>}
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
            <Button mb={4}>Login</Button>
          </form>
          <Divider color="#cccccc" />
          <p>Do you use two factor authentication?</p>
          <Button onClick={this.toggle2faForm}>Click here</Button>
        </Box>
      </Box>
    );
  }
}

export default Login;
