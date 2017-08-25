import React, { Component } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Box, Fixed, Text, Divider } from 'rebass';
import FontAwesome from 'react-fontawesome';
import { PlainPanel, UnstyledList, ResinBtn } from '../shared';
import store from '../../store';
import { updateUrl } from '../../services/path';
import FilterDescription from './filter-description';

const Wrapper = styled.div``;

const Preview = styled(PlainPanel)`
  display: none;
  position: absolute;
  right: 230px;
  width: 400px;
  right: 302px;
  top: 2px;
  padding: 15px 15px 5px;
`;

const ViewListItem = styled.li`
  position: relative;
  padding: 7px 20px;
  &:hover {
    background-color: #f3f3f3;
  }
  & > ${Text} {
    padding-right: 20px;
  }
  & > button {
    position: absolute;
    top: 7px;
    right: 10px;
    padding: 8px;
    background: none;
    border: none;
    display: none;
  }
  &:hover > button {
    display: block;
  }
  &:hover ${Preview} {
    display: block;
  }
`;

const MenuPanel = styled(PlainPanel)`
  position: absolute;
  width: 300px;
  right: 0;
  top: 36px;
  z-index: 1;
`;

class ViewsMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showViewsMenu: false,
    };
  }

  loadView(view) {
    store.dispatch({ type: 'SET_RULES', value: view.rules });
    this.setState({ showViewsMenu: false });
    updateUrl(view.rules);
  }

  render() {
    const { views, user } = this.props;
    const hasGlobalViews = views.global && !!views.global.length;
    const hasUserViews = views.user && views.user[user.login] && !!views.user[user.login].length;
    return (
      <Wrapper>
        <ResinBtn onClick={() => this.setState({ showViewsMenu: !this.state.showViewsMenu })}>
          <FontAwesome style={{ marginRight: 10 }} name="pie-chart" />
          Views
          <FontAwesome style={{ float: 'right' }} name="caret-down" />
        </ResinBtn>
        {this.state.showViewsMenu &&
          <Fixed
            z={1}
            onClick={() => this.setState({ showViewsMenu: false })}
            top
            right
            bottom
            left
          />}
        {this.state.showViewsMenu &&
          <MenuPanel className="views-menu__panel">
            {!hasGlobalViews &&
              !hasUserViews &&
              <Box p={3}>
                {"You haven't created any views yet"}
              </Box>}
            {hasGlobalViews &&
              <Box>
                <Text fontSize={13} ml={20} mb={2} mt={2} color="#ccc">
                  Global views
                </Text>
                <UnstyledList>
                  {views.global.map(view =>
                    (<ViewListItem key={view.name}>
                      <Text onClick={() => this.loadView(view)}>
                        {view.name}
                        <br />
                        <Text fontSize={12}>
                          {view.rules.length} filter{view.rules.length > 1 && 's'}
                        </Text>
                      </Text>
                      <button>
                        <FontAwesome name="trash" onClick={() => this.props.deleteView(view)} />
                      </button>
                      <Preview>
                        {view.rules.map(rule =>
                          (<Box mb={10} key={rule.id}>
                            <FilterDescription rule={rule} />
                          </Box>),
                        )}
                      </Preview>
                    </ViewListItem>),
                  )}
                </UnstyledList>
              </Box>}
            {hasGlobalViews && hasUserViews && <Divider color="#ccc" />}
            {hasUserViews &&
              <Box>
                <Text fontSize={13} ml={20} mb={2} mt={2} color="#ccc">
                  Your views
                </Text>
                <UnstyledList>
                  {views.user[user.login].map(view =>
                    (<ViewListItem key={view.id}>
                      <Text onClick={() => this.loadView(view)}>
                        {view.name}
                        <br />
                        <Text fontSize={12}>
                          {view.rules.length} filter{view.rules.length > 1 && 's'}
                        </Text>
                      </Text>
                      <button>
                        <FontAwesome name="trash" onClick={() => this.props.deleteView(view)} />
                      </button>
                      <Preview>
                        {view.rules.map(rule =>
                          (<Box mb={10} key={rule.id}>
                            <FilterDescription rule={rule} />
                          </Box>),
                        )}
                      </Preview>
                    </ViewListItem>),
                  )}
                </UnstyledList>
              </Box>}
          </MenuPanel>}
      </Wrapper>
    );
  }
}

const mapStatetoProps = ({ rules, views, user }) => ({
  rules,
  views: views || [],
  user,
});

export default connect(mapStatetoProps)(ViewsMenu);
