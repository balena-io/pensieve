import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import styled from 'styled-components'
import { Box, Button, Flex, Heading } from 'resin-components'
import { connect } from 'react-redux'
import { Container } from '../shared'
import { actions } from '../../actions'

const BlackBox = styled.div`
  background-color: #000000;
  position: relative;
`

const HeaderButton = styled(Button)`
  background: white;
`

class Header extends Component {
  logout () {
    this.props.logout()
    localStorage.clear()
    window.location.reload()
  }

  render () {
    console.log(this.props)
    return (
      <BlackBox>
        <Container>
          <Flex py={15} justify='space-between'>
            <Heading.h3 color='#fff' mt={1}>
              {this.props.config.repo.name}
            </Heading.h3>
            <Box>
              {!!this.props.branchInfo && (
                <HeaderButton
                  mr={10}
                  onClick={() =>
                    window.open(this.props.branchInfo._links.html, '_blank')
                  }
                >
                  <FontAwesome style={{ marginRight: 5 }} name='github-alt' />
                  Repository
                </HeaderButton>
              )}
              {this.props.isLoggedIn && (
                <HeaderButton color='red' onClick={() => this.logout()}>
                  <FontAwesome style={{ marginRight: 5 }} name='sign-out' />
                  Logout
                </HeaderButton>
              )}
            </Box>
          </Flex>
        </Container>
      </BlackBox>
    )
  }
}

const mapStatetoProps = state => ({
  branchInfo: state.branchInfo,
  config: state.config,
  isLoggedIn: state.isLoggedIn
})

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(actions.logout())
})

export default connect(mapStatetoProps, mapDispatchToProps)(Header)
