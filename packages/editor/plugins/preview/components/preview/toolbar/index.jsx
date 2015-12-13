import './index.scss'
import React from 'react';
import ToolComponent from './tool';

class ToolsComponent extends React.Component {
  render() {

    // TODO - these can be added as entries as well
    return <div className='m-editor-toolbar'>
      <ul className='m-toolbar-tools'>
        {
          this.props.app.plugins.query({
            type: 'previewTool'
          }).map((plugin) => {
            return <ToolComponent plugin={plugin} key={plugin.id} preview={this.props.app.preview} />;
          })
        }
      </ul>
    </div>
  }
}

export default ToolsComponent;
