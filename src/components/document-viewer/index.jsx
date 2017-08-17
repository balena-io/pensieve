import React, { Component } from 'react';
import { Button } from 'rebass';
import Filters from '../filters';
import Doc from './doc';
import DocFragmentCreator from './doc-fragment-creator';

class DocumentViewer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filterRules: [],
    };
  }

  render() {
    if (this.state.showNewEntryForm) {
      return (
        <div className="container">
          <DocFragmentCreator
            schema={this.props.schema}
            close={() => this.setState({ showNewEntryForm: false })}
          />
        </div>
      );
    }
    return (
      <div className="container">
        <div id="viewer">
          <Filters schema={this.props.schema} />
          <hr />
          <Button onClick={e => this.setState({ showNewEntryForm: true })}>Add entry</Button>
          <hr />
          <Doc />
        </div>
      </div>
    );
  }
}

export default DocumentViewer;
