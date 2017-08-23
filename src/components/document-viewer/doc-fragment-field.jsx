import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import showdown from 'showdown';

const converter = new showdown.Converter();

const makeNameClass = name => (name ? ` ${name.replace(/\s+/g, '_').toLowerCase()}` : '');

const formatData = (data) => {
  if (_.isBoolean(data)) {
    return data ? 'true' : 'false';
  }
  if (_.isDate(data)) {
    return data.toString();
  }

  return data;
};

const DocFragmentField = ({ title, data }) => {
  const nameClass = makeNameClass(title);
  if (_.isFunction(data)) {
    return null;
  }
  if (_.isString(data)) {
    return (
      <li>
        <h3>
          {title}
        </h3>
        <span
          className={`${nameClass} markdown-body`}
          dangerouslySetInnerHTML={{ __html: converter.makeHtml(data) }}
        />
      </li>
    );
  }
  return (
    <li>
      <h3>
        {title}
      </h3>
      <span className={`${nameClass}`}>
        {formatData(data)}
      </span>
    </li>
  );
};

DocFragmentField.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.oneOf(PropTypes.string, PropTypes.number, PropTypes.bool, PropTypes.date)
    .isRequired,
};

export default DocFragmentField;
