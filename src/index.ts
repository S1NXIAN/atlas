import type { PluginModule } from "@opencode-ai/plugin"

const pluginModule: PluginModule = {
  name: "atlas",
  description: "Unified OpenCode experience — methodology + context + infrastructure",

  config: async (config) => {
    // Skills auto-registration is handled by atlas.js plugin
    // This TypeScript module provides the infrastructure layer
    return config
  },
}

export default pluginModule
