import { homedir } from "os"
import { join } from "path"

export interface AtlasConfig {
  skillsPaths: string[]
  disableHooks: string[]
}

export function loadAtlasConfig(): AtlasConfig {
  return {
    skillsPaths: [],
    disableHooks: [],
  }
}

export function getAtlasConfigDir(): string {
  return process.env.OPENCODE_CONFIG_DIR || join(homedir(), ".config", "opencode")
}
