import React, { Component } from 'react';

import { Input } from 'rebass';

class FilterInput extends Component {
  render() {
    if (this.props.type === 'text') {
      return <Input value={this.props.value} onChange={this.props.onChange} />;
    }

    return null;
  }
}

export default FilterInput;
