import * as sift from "sift";
import { Logger } from "sf-core/logger";
import * as ReactDOM from "react-dom";
import { IApplication } from "sf-core/application";
import { filterAction, loggable } from "sf-core/decorators";
import { BaseApplicationService } from "sf-core/services";
import { ClassFactoryDependency } from "sf-core/dependencies";
import { ApplicationServiceDependency } from "sf-core/dependencies";
import { RootReactComponentDependency } from "sf-front-end/dependencies";

@loggable()
export default class RootComponentRenderer extends BaseApplicationService<IApplication> {

  public logger: Logger;
  private _rendering: boolean;

  @filterAction(sift({
    type: {
      $ne: /log/
    },
  }))
  execute() {
    if (this._rendering) return;
    this._rendering = true;
    requestAnimationFrame(this.render);
  }

  render = () => {
    this._rendering = false;
    const app = this.app;

    const rootComponentClassDependency = RootReactComponentDependency.find(this.app.dependencies);

    if (!rootComponentClassDependency) {
      this.logger.warn("Root React component was not found.");
      return;
    }

    ReactDOM.render(rootComponentClassDependency.create({

      // deprecated
      app: app,

      // deprecated
      bus: app.bus,
      dependencies: app.dependencies
    }), app.config.element);
  }
}

export const dependency = new ApplicationServiceDependency("root-component-renderer", RootComponentRenderer);