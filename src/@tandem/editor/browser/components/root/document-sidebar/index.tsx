
import * as React from "react";
import { SettingKeys } from "@tandem/editor/browser/constants";
import { GutterComponent } from "../gutter";
import { FrontEndApplication } from "@tandem/editor/browser/application";
import { DOCUMENT_PANE_COMPONENT_NS } from "@tandem/editor/browser/dependencies";

export class DocumentGutterComponent extends React.Component<{ app: FrontEndApplication }, any> {
  render() {
    return <GutterComponent
      {...this.props}
      position="left"
      hideKey={SettingKeys.HIDE_LEFT_SIDEBAR}
      maxWidth={800}
      sizeKey="documentSidebarSize"
      registeredComponentNs={[DOCUMENT_PANE_COMPONENT_NS, "**"].join("/")} />;
  }
}

