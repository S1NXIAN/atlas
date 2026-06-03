import { readFileSync, existsSync } from "fs"
import { join } from "path"
import { getAtlasConfigDir } from "../plugin-config"

export function injectProjectContext(directory: string): string | null {
  const agentsPath = join(directory, "AGENTS.md")
  const opencodeAgentsPath = join(directory, ".opencode", "AGENTS.md")
  const globalAgentsPath = join(getAtlasConfigDir(), "AGENTS.md")

  for (const path of [agentsPath, opencodeAgentsPath, globalAgentsPath]) {
    if (existsSync(path)) {
      return readFileSync(path, "utf8")
    }
  }

  return null
}
