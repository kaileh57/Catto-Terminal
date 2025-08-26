/// <reference types="node" />
/// <reference types="../shared/types" />

import type { ITerminalAPI, IAppAPI } from '../shared/types';

declare global {
  interface Window {
    terminal: ITerminalAPI;
    app: IAppAPI;
  }
}