import "server-only";

import { type ClientEnv, getClientEnv } from "./client";

export type ServerEnv = ClientEnv;

export function getServerEnv(): ServerEnv {
  return getClientEnv();
}
