import * as _ from 'lodash'
import { connect } from 'react-redux'
// import FilterComponent from './filter-component'
import { Filters } from 'resin-components'
import * as GitHubService from '../../services/github'
import { actions } from '../../actions'
import { transformSchema } from '../../util'

const makeUserViewScope = user => ({
  key: user.login,
  scopeLabel: 'just me', // Text shown when selecting where to save view
  title: user.login, // Text shown above views in views menu
  data: [] // array of views
})

const processViews = (views, user) => {
  if (_.isArray(views)) {
    // If the user's key already exists, filter out all the views except global and the users
    if (_.some(views, { key: user.login })) {
      return views.filter(v => v.key === 'global' || v.key === user.login)
    }

    // Otherwise, return the global views and a placeholder scaffold for the user views
    return views.filter(v => v.key === 'global').concat(makeUserViewScope(user))
  }

  // If there are no views, or the views are in the old object style, generate a default
  return [
    {
      key: 'global', // Unique key for this set of views
      scopeLabel: 'everyone', // Text shown when selecting where to save view
      title: 'Global', // Text shown above views in views menu
      data: [] // array of views
    },
    makeUserViewScope(user)
  ]
}

const mapStatetoProps = ({ rules, schema, user, views }) => {
  return {
    rules,
    schema: transformSchema(schema),
    user,
    views: processViews(views, user)
  }
}

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

export default connect(mapStatetoProps, mapDispatchToProps)(Filters)
