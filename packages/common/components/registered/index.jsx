import React from 'react';

class RegisteredComponent extends React.Component {
  render() {
    var app = this.props.app;
    var entries = app.plugins.query(this.props.query);
    var components = entries.map((plugin, i) => {
      return plugin.factory.create({
        plugin: plugin,
        key   : plugin.id,
        ...this.props
      });
    });

    return components.length === 1 ? components[0] : <span>{
      components
    }</span>;
  }
}

export default RegisteredComponent;
