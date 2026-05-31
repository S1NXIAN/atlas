import { type Plugin } from "@opencode-ai/plugin"

interface HooksConfig {
  before?: Record<string, string[]>
  after?: Record<string, string[]>
  onError?: Record<string, string[]>
}

const expandVars = (cmd: string, vars: Record<string, string>): string => {
  return cmd.replace(/\$\{?(\w+)\}?/g, (_, key) => vars[key] ?? `$\{${key}}`)
}

export const HooksPlugin: Plugin = async ({ $, directory }) => {
  let hooks: HooksConfig = {}

  try {
    const file = Bun.file(`${directory}/.opencode/hooks.json`)
    if (await file.exists()) {
      hooks = await file.json()
    }
  } catch {
    // No hooks config, skip
  }

  return {
    "tool.execute.before": async (input, output) => {
      const toolHooks = hooks.before?.[input.tool]
      if (!toolHooks?.length) return

      const vars: Record<string, string> = {
        TOOL: input.tool,
        ARGS: JSON.stringify(input.args ?? {}),
        ...Object.fromEntries(
          Object.entries(input.args ?? {}).map(([k, v]) => [k.toUpperCase(), String(v)]),
        ),
      }

      for (const raw of toolHooks) {
        const cmd = expandVars(raw, vars)
        await $`bash -c ${cmd}`.quiet()
      }
    },

    "tool.execute.after": async (input, output) => {
      const toolHooks = hooks.after?.[input.tool]
      if (!toolHooks?.length) return

      if (output.error && hooks.onError?.[input.tool]) {
        const errorHooks = hooks.onError[input.tool]
        const vars: Record<string, string> = {
          TOOL: input.tool,
          ARGS: JSON.stringify(input.args ?? {}),
          ERROR: String(output.error),
          ...Object.fromEntries(
            Object.entries(input.args ?? {}).map(([k, v]) => [k.toUpperCase(), String(v)]),
          ),
        }
        for (const raw of errorHooks) {
          const cmd = expandVars(raw, vars)
          await $`bash -c ${cmd}`.quiet()
        }
        return
      }

      const vars: Record<string, string> = {
        TOOL: input.tool,
        ARGS: JSON.stringify(input.args ?? {}),
        ...Object.fromEntries(
          Object.entries(input.args ?? {}).map(([k, v]) => [k.toUpperCase(), String(v)]),
        ),
      }

      for (const raw of toolHooks) {
        const cmd = expandVars(raw, vars)
        await $`bash -c ${cmd}`.quiet()
      }
    },
  }
}
