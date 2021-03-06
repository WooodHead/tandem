import { URIProtocolProvider } from "@tandem/sandbox";
import { ExpressServerProvider } from "./providers";
import express = require("express");
import { 
  GetProjectCommand,
  SpawnWorkerCommand,
  WatchProjectCommand,
  UpdateProjectCommand,
  CreateNewProjectCommand, 
  CreateProjectFileCommand,
  ResolveProjectFileURICommand,
  OpenProjectEnvironmentChannelCommand,
} from "./commands";

import { HTTPRouteService } from "./services";
import { EditorMasterStore } from "./stores";
import { SpawnWorkerRequest } from "./messages";
import { IEditorMasterConfig } from "./config";
import { createHTTPRouteProviders } from "./routes";

import { 
  IProvider, 
  CommandFactoryProvider, 
  ApplicationServiceProvider,
  ApplicationConfigurationProvider,
} from "@tandem/common";

import { EditorMasterStoreProvider, HTTPRouteProvider } from "./providers";

import { 
  GetProjectRequest,
  UpdateProjectRequest,
  WatchProjectRequest,
  CreateNewProjectRequest, 
  ResolveWorkspaceURIRequest,
  createCommonEditorProviders, 
  CreateTemporaryWorkspaceRequest,
  OpenProjectEnvironmentChannelRequest,
} from "@tandem/editor/common";

export const createEditorMasterProviders = (config: IEditorMasterConfig) => {

  const server = express();

  return [
    ...createHTTPRouteProviders(),
    createCommonEditorProviders(config),
    new ExpressServerProvider(server, server.listen(config.server.port)),
    new CommandFactoryProvider(UpdateProjectRequest.UPDATE_PROJECT, UpdateProjectCommand),
    new CommandFactoryProvider(WatchProjectRequest.WATCH_PROJECT, WatchProjectCommand),
    new CommandFactoryProvider(ResolveWorkspaceURIRequest.RESOLVE_WORKSPACE_URI, ResolveProjectFileURICommand),
    new CommandFactoryProvider(CreateTemporaryWorkspaceRequest.CREATE_TEMPORARY_WORKSPACE, CreateProjectFileCommand),
    new CommandFactoryProvider(GetProjectRequest.GET_PROJECT, GetProjectCommand),
    new CommandFactoryProvider(CreateNewProjectRequest.CREATE_NEW_PROJECT, CreateNewProjectCommand),
    new CommandFactoryProvider(OpenProjectEnvironmentChannelRequest.OPEN_PROJECT_ENVIRONMENT_CHANNEL, OpenProjectEnvironmentChannelCommand),
    new CommandFactoryProvider(SpawnWorkerRequest.SPAWN_WORKER, SpawnWorkerCommand),
    new ApplicationServiceProvider("httpRoutes", HTTPRouteService),
    new EditorMasterStoreProvider(EditorMasterStore)
  ];
}

export * from "./commands";
export * from "./messages";
export * from "./config";
export * from "./providers";
export * from "./routes/base";