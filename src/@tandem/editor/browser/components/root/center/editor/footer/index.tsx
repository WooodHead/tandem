import "./index.scss";

import * as React from "react";
import { Workspace } from "@tandem/editor/browser/models";
import { SetZoomAction } from "@tandem/editor/browser/actions";
import * as AutosizeInput from "react-input-autosize";
import { FrontEndApplication } from "@tandem/editor/browser/application";
import { RegisteredComponent, FocusComponent } from "@tandem/editor/browser/components/common";
import { FooterComponentFactoryDependency } from "@tandem/editor/browser/dependencies";

class ZoomLabelComponent extends React.Component<{ workspace: Workspace, app: FrontEndApplication }, { editZoom: number }> {
  constructor() {
    super();
    this.state = { editZoom: null };
  }

  editZoom = () => {
    this.setState({ editZoom: this.props.workspace.transform.scale * 100 });
  }

  onFocus = (event: React.FocusEvent<any>) => {
    (event.target as any).select();
  }

  doneEditing = () => {
    this.setState({ editZoom: undefined });
  }

  onInputChange = (event: React.KeyboardEvent<any>) => {
    const value = Number((event.target as any).value || 0);
    this.setState({ editZoom: value });
    this.props.app.bus.execute(new SetZoomAction(value ? value / 100 : value));
  }

  onKeyDown = (event: React.KeyboardEvent<any>) => {
    if (event.keyCode === 13) {
      this.setState({ editZoom: undefined });
    }
  }

  render() {
    const { scale } = this.props.workspace.transform;
    return <span>{ this.state.editZoom != null ? this.renderEditZoom(scale) : <span onClick={this.editZoom}>{Math.round((scale || 0) * 100)}</span> }%</span>;
  }

  renderEditZoom(scale: number) {
    return <FocusComponent><AutosizeInput
      type="text"
      className="footer-zoom-input"
      onFocus={this.onFocus}
      value={Math.round(this.state.editZoom)}
      onChange={this.onInputChange}
      onBlur={this.doneEditing}
      onKeyDown={this.onKeyDown}
      /></FocusComponent>
  }
}

class FooterComponent extends React.Component<{ workspace: Workspace, app: FrontEndApplication }, any> {
  render() {
    const { scale } = this.props.workspace.transform;
    return (<div className="m-preview-footer">
      <ZoomLabelComponent {...this.props} />
      <RegisteredComponent {...this.props} ns={FooterComponentFactoryDependency.getNamespace("**")} />
    </div>);
  }
}

export default FooterComponent;
