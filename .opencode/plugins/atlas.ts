import { type Plugin, tool } from "@opencode-ai/plugin"

const PIPELINE_ORDER = [
  "spec-writer",
  "code-scout",
  "plan-crafter",
  "code-forge",
  "doc-fetch",
  "work-weaver",
  "code-review",
  "security-scan",
  "code-clean",
  "done-check",
] as const

export const AtlasPlugin: Plugin = async ({ client }) => {
  return {
    "session.created": async () => {
      await client.app.log({
        body: {
          service: "atlas",
          level: "info",
          message: "Pipeline session created",
          extra: { pipeline: PIPELINE_ORDER.join(" → ") },
        },
      })
    },

    "experimental.session.compacting": async (input, output) => {
      output.context.push(`## Atlas Pipeline State
Active pipeline steps: ${PIPELINE_ORDER.join(" → ")}
Current step being executed. Next steps after current agent completes.`)

      output.context.push(`## Pipeline Rules
- spec-writer must complete before code-scout and plan-crafter can start
- code-scout and plan-crafter run in parallel
- code-forge and doc-fetch run in parallel
- work-weaver integrates all outputs
- code-review and security-scan run in parallel (mandatory gates)
- code-clean runs after review gates pass
- done-check is the final gate
- If code-review or security-scan fail, route back to code-forge
- Never skip code-review, security-scan, or done-check`)
    },

    tool: {
      pipeline_run: tool({
        description: "Execute the full atlas pipeline for a task through all 10 subagents",
        args: {
          task: tool.schema.string().describe("The task to execute through the pipeline"),
        },
        async execute(args) {
          return `Pipeline initiated for: ${args.task}\nSequence: ${PIPELINE_ORDER.join(" → ")}`
        },
      }),

      pipeline_status: tool({
        description: "Get the current pipeline step and its status",
        args: {
          currentStep: tool.schema.string().optional().describe("Current pipeline step name"),
          status: tool.schema.string().optional().describe("Status: running/passed/failed/skipped"),
        },
        async execute(args) {
          const step = args.currentStep ?? "not started"
          const status = args.status ?? "running"
          const idx = PIPELINE_ORDER.indexOf(step as typeof PIPELINE_ORDER[number])
          const remaining = idx >= 0 ? PIPELINE_ORDER.slice(idx + 1) : PIPELINE_ORDER
          return [
            `Current: ${step} [${status}]`,
            `Completed: ${PIPELINE_ORDER.slice(0, idx).join(", ") || "none"}`,
            `Remaining: ${remaining.join(" → ") || "none"}`,
          ].join("\n")
        },
      }),

      pipeline_reroute: tool({
        description: "Re-route the pipeline back to a previous step (e.g., code-forge after review failure)",
        args: {
          target: tool.schema.string().describe("The subagent to re-route to"),
          reason: tool.schema.string().describe("Why re-routing is needed"),
        },
        async execute(args) {
          return `Re-routing to ${args.target}. Reason: ${args.reason}\nAfter ${args.target} completes, re-run code-review and security-scan.`
        },
      }),
    },
  }
}
