import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Box } from 'rebass';
import Alert from './alert';
import * as NotificationService from '../../services/notifications';

window.NotificationService = NotificationService;

const dismiss = (id) => {
  NotificationService.dismiss(id);
};

const Alerts = props =>
  (<Box mb={30}>
    {_.map(props.alerts, item =>
      (<Alert key={item.id} type={item.type} dismiss={() => dismiss(item.id)}>
        {item.message}
      </Alert>),
    )}
  </Box>);

const mapStatetoProps = ({ alerts }) => ({
  alerts,
});

export default connect(mapStatetoProps)(Alerts);
