import { connect } from 'react-redux';
import FilterComponent from './filter-component';
import * as GitHubService from '../../services/github';

const mapStatetoProps = ({ rules, schema, user, views }) => ({
  rules,
  schema,
  user,
  views,
});

const mapDispatchToProps = dispatch => ({
  setRules: rules => dispatch({ type: 'SET_RULES', value: rules }),
  setViews: (views) => {
    GitHubService.commitViews(views);
    return dispatch({ type: 'SET_VIEWS', value: views });
  },
});

export default connect(mapStatetoProps, mapDispatchToProps)(FilterComponent);
