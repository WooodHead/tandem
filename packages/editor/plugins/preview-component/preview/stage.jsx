import './stage.scss';

import React from 'react';
import NodeComponent from './node';

class StageComponent extends React.Component {

  onClick(event) {

    var rect = this.refs.canvas.getBoundingClientRect();


    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    this.props.app.preview.currentTool.notify({
      type: 'click',
      x: x,
      y: y
    });
  }

  render() {

    var app = this.props.app;
    var preview = this.props.app.preview;

    var canvasStyle = {
      width: preview.canvasWidth,
      height: preview.canvasHeight
    };

    var previewStyle = {
      cursor: preview.currentTool.cursor
    };

    // TODO - canvas needs to have different types of layers

    return <div className='m-preview-stage' style={previewStyle}>
      <div ref='canvas' className='m-preview-stage--canvas' style={canvasStyle} onClick={this.onClick.bind(this)}>
        <NodeComponent node={app.currentSymbol} app={app} />
      </div>
    </div>;
  }
}

export default StageComponent;