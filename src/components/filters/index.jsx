import * as _ from 'lodash'
import { connect } from 'react-redux'
import FilterComponent from './filter-component'
import * as GitHubService from '../../services/github'
import { actions } from '../../actions'

const mapStatetoProps = ({ rules, schema, user, views }) => ({
  rules,
  schema,
  user,
  views
})

const mapDispatchToProps = dispatch => ({
  setRules: rules => dispatch(actions.setRules(rules)),
  setViews: _.debounce(
    views => {
      GitHubService.commitViews(views)
      return dispatch(actions.setViews(views))
    },
    1000,
    { leading: true, trailing: false }
  )
})

export default connect(mapStatetoProps, mapDispatchToProps)(FilterComponent)
