import { type Plugin, tool } from "@opencode-ai/plugin"
import path from "path"

// ── Stage enum (FSM states) ─────────────────────────────────────
enum Stage {
  SpecWriter = "spec-writer",
  CodeScout = "code-scout",
  PlanCrafter = "plan-crafter",
  ContractDefinition = "contract-definition",
  CodeForge = "code-forge",
  DocFetch = "doc-fetch",
  WorkWeaver = "work-weaver",
  CodeReview = "code-review",
  SecurityScan = "security-scan",
  CodeClean = "code-clean",
  DoneCheck = "done-check",
  Complete = "complete",
  Failed = "failed",
}

const PIPELINE_ORDER: readonly Stage[] = [
  Stage.SpecWriter,
  Stage.CodeScout,
  Stage.PlanCrafter,
  Stage.ContractDefinition,
  Stage.CodeForge,
  Stage.DocFetch,
  Stage.WorkWeaver,
  Stage.CodeReview,
  Stage.SecurityScan,
  Stage.CodeClean,
  Stage.DoneCheck,
] as const

// Only code-review and security-scan can reroute back to code-forge
const REROUTE_TARGETS: Partial<Record<Stage, Stage>> = {
  [Stage.CodeReview]: Stage.CodeForge,
  [Stage.SecurityScan]: Stage.CodeForge,
}

// ── Evidence gate types ─────────────────────────────────────────
interface GateResult {
  pass: boolean
  message: string
}

interface GateCheck {
  name: string
  check: (output: string) => GateResult | Promise<GateResult>
}

// ── Evidence gates per stage ────────────────────────────────────
const EVIDENCE_GATES: Record<Stage, GateCheck[]> = {
  [Stage.SpecWriter]: [
    { name: "has-acceptance-criteria", check: (o) => ({ pass: o.includes("## Acceptance Criteria"), message: o.includes("## Acceptance Criteria") ? "Acceptance criteria section found" : "Missing ## Acceptance Criteria section" }) },
    { name: "has-scope", check: (o) => ({ pass: o.includes("## Scope"), message: o.includes("## Scope") ? "Scope section found" : "Missing ## Scope section" }) },
    { name: "scope-has-in-out", check: (o) => ({ pass: o.includes("In:") && o.includes("Out:"), message: (o.includes("In:") && o.includes("Out:")) ? "Scope has In/Out" : "Scope missing In: or Out:" }) },
    { name: "min-length", check: (o) => ({ pass: o.length > 100, message: o.length > 100 ? `Output length ${o.length} > 100` : `Output too short: ${o.length} chars` }) },
  ],
  [Stage.CodeScout]: [
    { name: "has-file-paths", check: (o) => { const matches = o.match(/[\w\-\.\/]+\.[a-z]+/g); return { pass: matches !== null && matches.length >= 1, message: matches ? `Found ${matches.length} file paths` : "No file paths found" } } },
    { name: "min-sources", check: (o) => { const matches = o.match(/[\w\-\.\/]+\.[a-z]+/g); const unique = [...new Set(matches || [])]; return { pass: unique.length >= 2, message: `${unique.length} unique sources (need >= 2)` } } },
  ],
  [Stage.PlanCrafter]: [
    { name: "has-numbered-steps", check: (o) => ({ pass: /^\d+\.\s/m.test(o), message: /^\d+\.\s/m.test(o) ? "Numbered steps found" : "No numbered steps found" }) },
    { name: "has-implementation-plan", check: (o) => ({ pass: o.includes("## Implementation Plan"), message: o.includes("## Implementation Plan") ? "Implementation Plan section found" : "Missing ## Implementation Plan" }) },
    { name: "has-task-json", check: async (o) => { try { const glob = new Bun.Glob(".tmp/tasks/*/task.json"); const matches = await glob.scan({ cwd: "/home/xian/Work/atlas" }); const first = await matches.next(); return { pass: !first.done, message: !first.done ? "task.json found" : "No task.json found" } } catch { return { pass: true, message: "Could not check task.json (glob not available)" } } } },
  ],
  [Stage.ContractDefinition]: [
    { name: "output-matches-ts-files", check: (o) => ({ pass: /\.(ts|d\.ts)/i.test(o), message: /\.(ts|d\.ts)/i.test(o) ? "TypeScript file references found" : "No .ts or .d.ts file references" }) },
    { name: "contracts-dir-exists", check: async (o) => { try { const dir = Bun.file("/home/xian/Work/atlas/.tmp/contracts"); return { pass: await dir.exists(), message: (await dir.exists()) ? ".tmp/contracts/ exists" : ".tmp/contracts/ not found" } } catch { return { pass: false, message: "Could not check .tmp/contracts/" } } } },
  ],
  [Stage.CodeForge]: [
    { name: "artifact-exists", check: async (o) => { const paths = o.match(/[\w\-\.\/]+\.[a-z]+/g); if (!paths) return { pass: false, message: "No file paths in output" }; const existingResults = await Promise.all(paths.map(async p => { try { return { path: p, exists: await Bun.file(p).exists() } } catch { return { path: p, exists: false } } })); const existing = existingResults.filter(r => r.exists).map(r => r.path); return { pass: existing.length > 0, message: existing.length > 0 ? `Artifact exists: ${existing[0]}` : "No artifact file found on disk" } } },
    { name: "all-batch-artifacts-exist", check: async (o) => { try { const parts = o.split("subtasks:"); if (!parts[1]) return { pass: true, message: "No subtasks section to check" }; const matches = parts[1].match(/["']?files["']?\s*:\s*\[([^\]]+)\]/); if (!matches) return { pass: true, message: "No files array in output" }; const paths = matches[1].match(/["']([^"']+)["']/g); if (!paths) return { pass: true, message: "No file paths found" }; const cleanPaths = paths.map(p => p.replace(/["']/g, "")); const results = await Promise.all(cleanPaths.map(async p => { try { return { path: p, exists: await Bun.file(p).exists() } } catch { return { path: p, exists: false } } })); const missing = results.filter(r => !r.exists); return { pass: missing.length === 0, message: missing.length === 0 ? `All ${results.length} batch artifacts exist` : `Missing: ${missing.slice(0, 3).map(m => m.path).join(", ")}` } } catch { return { pass: true, message: "Could not verify batch artifacts" } } } },
    { name: "has-implementation-report", check: (o) => ({ pass: o.includes("## Implementation Report"), message: o.includes("## Implementation Report") ? "Implementation Report found" : "Missing ## Implementation Report" }) },
    { name: "has-pass-or-success", check: (o) => ({ pass: /PASS|SUCCESS/i.test(o), message: /PASS|SUCCESS/i.test(o) ? "PASS/SUCCESS found" : "No PASS or SUCCESS in output" }) },
  ],
  [Stage.DocFetch]: [
    { name: "has-url-refs", check: (o) => { const urls = o.match(/https?:\/\/[^\s]+/g); return { pass: urls !== null && urls.length >= 1, message: urls ? `Found ${urls.length} URL references` : "No URL references found" } } },
    { name: "min-length", check: (o) => ({ pass: o.length > 200, message: o.length > 200 ? `Output length ${o.length} > 200` : `Output too short: ${o.length} chars` }) },
  ],
  [Stage.WorkWeaver]: [
    { name: "references-all-agents", check: (o) => { const agents = ["spec-writer", "code-scout", "plan-crafter", "contract-definition", "code-forge", "doc-fetch", "work-weaver", "code-review", "security-scan", "code-clean", "done-check"]; const missing = agents.filter(a => !o.toLowerCase().includes(a)); return { pass: missing.length === 0, message: missing.length === 0 ? "All 11 agents referenced" : `Missing references: ${missing.join(", ")}` } } },
    { name: "has-integration-summary", check: (o) => ({ pass: o.includes("## Integration Summary") || o.includes("## Integration Report"), message: (o.includes("## Integration Summary") || o.includes("## Integration Report")) ? "Integration summary found" : "Missing ## Integration Summary or ## Integration Report" }) },
  ],
  [Stage.CodeReview]: [
    { name: "has-pass-or-changes", check: (o) => ({ pass: /PASS|Changes requested/i.test(o), message: /PASS|Changes requested/i.test(o) ? "PASS or Changes requested found" : "No PASS or Changes requested" }) },
    { name: "not-skipped", check: (o) => ({ pass: !/SKIP/i.test(o), message: /SKIP/i.test(o) ? "Review was SKIPPED" : "Review was not skipped" }) },
    { name: "check-fail-reroute", check: (o) => ({ pass: !/FAIL/i.test(o), message: /FAIL/i.test(o) ? "FAIL found — reroute trigger" : "No FAIL found" }) },
  ],
  [Stage.SecurityScan]: [
    { name: "vuln-count-or-clean", check: (o) => ({ pass: /VULN_COUNT:|No vulnerabilities found/i.test(o), message: /VULN_COUNT:|No vulnerabilities found/i.test(o) ? "Vulnerability report found" : "No vulnerability report" }) },
    { name: "not-skipped", check: (o) => ({ pass: !/SKIP/i.test(o), message: /SKIP/i.test(o) ? "Security scan was SKIPPED" : "Security scan was not skipped" }) },
  ],
  [Stage.CodeClean]: [
    { name: "no-todos", check: (o) => { try { const proc = Bun.spawnSync(["bash", "-c", "rg -n 'TODO|FIXME|HACK|XXX' --glob '!node_modules' --glob '!.git' . 2>/dev/null | wc -l"]); const count = parseInt(proc.stdout.toString().trim()) || 0; return { pass: count === 0, message: count === 0 ? "No TODOs/FIXMEs found" : `${count} TODOs/FIXMEs/HACKs/XXXs found` } } catch { return { pass: true, message: "Could not check TODOs (rg not available)" } } } },
    { name: "plan-files-exist", check: async (o) => { try { const stateFile = Bun.file("/home/xian/Work/atlas/WORKFLOW_STATE.md"); if (!(await stateFile.exists())) return { pass: true, message: "No WORKFLOW_STATE.md to check" }; const content = await stateFile.text(); /* Extract plan-crafter output path from state file */ const match = content.match(/plan-crafter\s*\|\s*(?:passed|running)\s*\|\s*(\S+)/i); if (!match) return { pass: true, message: "No plan-crafter output path in state" }; const planPath = match[1]; const planFile = Bun.file(planPath); if (!(await planFile.exists())) return { pass: true, message: "Plan file not found, skipping file existence check" }; const planContent = await planFile.text(); const paths = planContent.match(/[\w\-\.\/]+\.[a-z]+/g); if (!paths) return { pass: true, message: "No file paths in plan" }; const missingResults = await Promise.all(paths.map(async p => { try { return { path: p, exists: await Bun.file(p).exists() } } catch { return { path: p, exists: false } } })); const missing = missingResults.filter(r => !r.exists).map(r => r.path); return { pass: missing.length === 0, message: missing.length === 0 ? `All ${paths.length} plan files exist` : `Missing files: ${missing.slice(0, 5).join(", ")}` } } catch { return { pass: true, message: "Could not verify plan files" } } } },
  ],
  [Stage.DoneCheck]: [
    { name: "all-criteria-met", check: (o) => ({ pass: o.includes("ALL_ACCEPTANCE_CRITERIA_MET: true"), message: o.includes("ALL_ACCEPTANCE_CRITERIA_MET: true") ? "All acceptance criteria met" : "Missing ALL_ACCEPTANCE_CRITERIA_MET: true" }) },
    { name: "has-verification-results", check: (o) => ({ pass: o.includes("## Verification Results"), message: o.includes("## Verification Results") ? "Verification results found" : "Missing ## Verification Results" }) },
  ],
  [Stage.Complete]: [],
  [Stage.Failed]: [],
}

// ── State file helpers ──────────────────────────────────────────
const STATE_FILE = "/home/xian/Work/atlas/WORKFLOW_STATE.md"

async function getStageFromFile(): Promise<{ stage: Stage; status: string } | null> {
  try {
    const file = Bun.file(STATE_FILE)
    if (!(await file.exists())) return null
    const content = await file.text()
    const phaseMatch = content.match(/## Current Phase\s*\n(.+)/i)
    if (!phaseMatch) return null
    const phase = phaseMatch[1].trim().split(/\s/)[0]
    // Validate phase is a Stage enum value (case-insensitive)
    const valid = Object.values(Stage).includes(phase as Stage)
    if (!valid) {
      const matched = Object.values(Stage).find(s => s.toLowerCase() === phase.toLowerCase())
      if (matched) return { stage: matched, status: "running" }
      return null
    }
    return { stage: phase as Stage, status: "running" }
  } catch {
    return null
  }
}

function getStageIndex(stage: Stage): number {
  return PIPELINE_ORDER.indexOf(stage)
}

// ── Plugin export ───────────────────────────────────────────────
export const PipelinePlugin: Plugin = async ({ client }) => {
  return {
    "experimental.session.compacting": async (input, output) => {
      const state = await getStageFromFile()
      if (state) {
        output.context.push(`## Active Phase: ${state.stage}`)
      }
      output.context.push(`## Pipeline Steps
${PIPELINE_ORDER.join(" → ")}`)
      output.context.push(`## Pipeline Rules
- WORKFLOW_STATE.md is canonical handoff — read before starting, update own section only
- Only code-forge may edit code files
- Evidence gates run after every agent (deterministic checks, no LLM)
- code-review or security-scan failure → reroute to code-forge
- All other failures → pipeline stops`)

      // Check for active session
      try {
        const sessionGlob = new Bun.Glob(".tmp/sessions/*/")
        const sessionMatches = await sessionGlob.scan({ cwd: "/home/xian/Work/atlas" })
        const firstSession = await sessionMatches.next()
        if (!firstSession.done) {
          output.context.push(`## Session Context: ${firstSession.value}`)
        }
      } catch {
        // Non-fatal: session check is best-effort
      }
    },

    tool: {
      pipeline_run: tool({
        description: "Execute the full atlas pipeline for a task through all 11 subagents",
        args: {
          task: tool.schema.string().describe("The task to execute through the pipeline"),
        },
        async execute(args) {
          // Validate existing state file before overwriting
          const existingFile = Bun.file(STATE_FILE)
          if (await existingFile.exists()) {
            const existingContent = await existingFile.text()
            if (!existingContent.includes("## Current Phase")) {
              return `Pipeline state file exists but is malformed — missing ## Current Phase header. Fix it or delete it first.`
            }
          }

          // Clean up previous session data (from last run)
          try {
            const existingFile = Bun.file(STATE_FILE)
            if (await existingFile.exists()) {
              const content = await existingFile.text()
              // Extract previous session path
              const sessionMatch = content.match(/\|\s*path\s*\|\s*(.+?)\s*\|/)
              if (sessionMatch) {
                const prevSessionDir = sessionMatch[1].trim()
                if (prevSessionDir) {
                  const resolved = path.resolve(prevSessionDir)
                  const relative = path.relative("/home/xian/Work/atlas/.tmp/sessions", resolved)
                  if (relative && !relative.startsWith("..") && !path.isAbsolute(relative)) {
                    Bun.spawnSync(["rm", "-rf", resolved])
                  }
                }
              }
            }
          } catch (e) {
            // Non-fatal: cleanup is best-effort
            console.error(`Session cleanup warning: ${e}`)
          }

          // Write initial state
          const initialState = `# Atlas Pipeline State

## Current Phase
${Stage.SpecWriter}

## Agent Outputs

| Agent | Status | Output Path | Evidence (SHA-256) | Gate Result |
|-------|--------|-------------|---------------------|-------------|
| spec-writer | pending | — | — | — |
| code-scout | pending | — | — | — |
| plan-crafter | pending | — | — | — |
| contract-definition | pending | — | — | — |
| code-forge | pending | — | — | — |
| doc-fetch | pending | — | — | — |
| work-weaver | pending | — | — | — |
| code-review | pending | — | — | — |
| security-scan | pending | — | — | — |
| code-clean | pending | — | — | — |
| done-check | pending | — | — | — |

## Blockers
- None

## Gate Results

| Step | Gate | Result | Evidence |
|------|------|--------|----------|
| — | — | — | — |

## Approvals

| Gate | Status | Timestamp |
|------|--------|-----------|
| pre-execution | pending | — |

## Session Context

| Field | Value |
|----------|-------|
| task | — |
| created | — |
| status | in_progress |
| path | — |
| context_files | — |
| reference_files | — |
| components | — |
| exit_criteria | — |
`
          try {
            await Bun.write(STATE_FILE, initialState)
          } catch (e) {
            return `Failed to initialize pipeline state: ${e}`
          }

          // Create session directory
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
          const taskSlug = args.task.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)
          const sessionDir = `/home/xian/Work/atlas/.tmp/sessions/${timestamp}-${taskSlug}`
          try {
            Bun.spawnSync(["mkdir", "-p", sessionDir])
          } catch (e) {
            console.error(`Failed to create session directory: ${e}`)
            // Non-fatal: session dir is best-effort
          }

          // Record session in state file
          try {
            let stateContent = await Bun.file(STATE_FILE).text()
            const sessionRow = `| task | ${args.task.slice(0, 200)} |\n| created | ${new Date().toISOString()} |\n| status | in_progress |\n| path | ${sessionDir} |\n| context_files | — |\n| reference_files | — |\n| components | — |\n| exit_criteria | — |`
            if (stateContent.includes("## Session Context")) {
              stateContent = stateContent.replace(/## Session Context[\s\S]*?(?=\n## |$)/, `## Session Context\n\n| Field | Value |\n|----------|-------|\n${sessionRow}`)
            } else {
              stateContent += `\n## Session Context\n\n| Field | Value |\n|----------|-------|\n${sessionRow}\n`
            }
            await Bun.write(STATE_FILE, stateContent)
          } catch (e) {
            console.error(`Failed to record session path: ${e}`)
          }

          // Prune sessions older than 30 days
          try {
            Bun.spawnSync(["bash", "-c", `find /home/xian/Work/atlas/.tmp/sessions -mindepth 1 -maxdepth 1 -type d -mtime +30 -exec rm -rf {} + 2>/dev/null`])
          } catch (e) {
            console.error(`Session pruning warning: ${e}`)
          }

          return `Pipeline initiated for: ${args.task}
Sequence: ${PIPELINE_ORDER.join(" → ")}
Current phase: ${Stage.SpecWriter}
State file: ${STATE_FILE}
Session context: WORKFLOW_STATE.md → ## Session Context`
        },
      }),

      pipeline_status: tool({
        description: "Get the current pipeline step and its status",
        args: {
          currentStep: tool.schema.string().optional().describe("Current pipeline step name"),
          status: tool.schema.string().optional().describe("Status: running/passed/failed/skipped"),
        },
        async execute(args) {
          const state = await getStageFromFile()
          if (!state) {
            return "No pipeline state found. Run pipeline_run first."
          }

          const step = args.currentStep ?? state.stage
          const stat = args.status ?? "running"
          const idx = getStageIndex(step as Stage)
          const completed = idx >= 0 ? PIPELINE_ORDER.slice(0, idx) : []
          const remaining = idx >= 0 ? PIPELINE_ORDER.slice(idx + 1) : PIPELINE_ORDER

          // Validate step is in enum
          if (!Object.values(Stage).includes(step as Stage)) {
            return `Invalid step: ${step}. Must be one of: ${Object.values(Stage).join(", ")}`
          }

          // Check pre-execution approval gate when next step is code-forge
          const nextStep = idx >= 0 && idx < PIPELINE_ORDER.length - 1 ? PIPELINE_ORDER[idx + 1] : null
          if (step === Stage.CodeForge || nextStep === Stage.CodeForge) {
            const stateContent = await Bun.file(STATE_FILE).text()
            if (stateContent.includes("## Approvals") && stateContent.includes("| pre-execution | pending |")) {
              return [...[`Current: ${step} [${stat}]`,
                `Completed: ${completed.join(", ") || "none"}`,
                `Remaining: ${remaining.join(" → ") || "none"}`,
                `State file: ${STATE_FILE}`,
              ], "AWAITING_APPROVAL: Pre-execution gate is pending — run pipeline_approve to continue"].join("\n")
            }
          }

          // If transitioning to Complete, clean up session
          if (step === Stage.Complete && stat.toLowerCase() === "passed") {
            try {
              const content = await Bun.file(STATE_FILE).text()
              const sessionMatch = content.match(/\|\s*path\s*\|\s*(.+?)\s*\|/)
              if (sessionMatch) {
                const sessionDir = sessionMatch[1].trim()
                if (sessionDir) {
                  const resolved = path.resolve(sessionDir)
                  const relative = path.relative("/home/xian/Work/atlas/.tmp/sessions", resolved)
                  if (relative && !relative.startsWith("..") && !path.isAbsolute(relative)) {
                    Bun.spawnSync(["rm", "-rf", resolved])
                  }
                }
              }
              // Update session status in state file
              let updated = content.replace(/status\s*\|\s*in_progress/, "status | completed")
              updated = updated.replace(/status\s*\|\s*completed/, "status | completed")
              await Bun.write(STATE_FILE, updated)
            } catch (e) {
              console.error(`Session cleanup on complete failed: ${e}`)
            }
          }

          return [
            `Current: ${step} [${stat}]`,
            `Completed: ${completed.join(", ") || "none"}`,
            `Remaining: ${remaining.join(" → ") || "none"}`,
            `State file: ${STATE_FILE}`,
          ].join("\n")
        },
      }),

      pipeline_approve: tool({
        description: "Record an approval decision in the pipeline state",
        args: {
          gate: tool.schema.string().describe("The approval gate name (e.g. 'pre-execution')"),
          decision: tool.schema.string().describe("Approval decision: 'approved' or 'denied'"),
          reason: tool.schema.string().optional().describe("Optional reason for the decision"),
        },
        async execute(args) {
          const gate = args.gate
          const decision = args.decision
          if (!["approved", "denied"].includes(decision)) {
            return `Invalid decision: ${decision}. Must be 'approved' or 'denied'.`
          }
          const allowedGates = ["pre-execution"]
          if (!allowedGates.includes(gate)) {
            return `Unknown gate: ${gate}. Allowed gates: ${allowedGates.join(", ")}`
          }
          try {
            const file = Bun.file(STATE_FILE)
            if (!(await file.exists())) {
              return "No pipeline state found. Run pipeline_run first."
            }
            let content = await file.text()
            const timestamp = new Date().toISOString()
            // Find and replace the gate row in ## Approvals table
            const gateRegex = new RegExp(`(\\|\\s*)${gate}(\\s*\\|\\s*)\\w+(\\s*\\|\\s*)[^|]*(\\s*\\|)`)
            const replacement = `$1${gate}$2${decision}$3${timestamp}$4`
            if (gateRegex.test(content)) {
              content = content.replace(gateRegex, replacement)
            } else {
              // Add header section if missing
              if (!content.includes("## Approvals")) {
                content += `\n\n## Approvals\n\n| Gate | Status | Timestamp |\n|------|--------|-----------|\n| ${gate} | ${decision} | ${timestamp} |\n`
              } else {
                // Add row to existing section
                content = content.replace(/(## Approvals[\s\S]*?)(?=\n## |$)/, `$1\n| ${gate} | ${decision} | ${timestamp} |`)
              }
            }
            await Bun.write(STATE_FILE, content)
            return `Approval recorded: ${gate} = ${decision} at ${timestamp}${args.reason ? ` (reason: ${args.reason})` : ""}`
          } catch (e) {
            return `Failed to record approval: ${e}`
          }
        },
      }),

      pipeline_reroute: tool({
        description: "Re-route the pipeline back to code-forge after review or security-scan failure",
        args: {
          target: tool.schema.string().describe("The subagent to re-route to"),
          reason: tool.schema.string().describe("Why re-routing is needed"),
        },
        async execute(args) {
          const targetStage = args.target as Stage

          // Validate target is a valid Stage
          if (!Object.values(Stage).includes(targetStage)) {
            return `Invalid target: ${args.target}`
          }

          // Only code-forge is a valid reroute destination
          if (targetStage !== Stage.CodeForge) {
            return `Cannot reroute to ${args.target}. Only code-forge is a valid reroute destination for bug fixes after review/scan failure.`
          }

          // Update state file
          try {
            const file = Bun.file(STATE_FILE)
            if (!(await file.exists())) {
              return "No pipeline state found. Run pipeline_run first."
            }
            let content = await file.text()
            content = content.replace(/## Current Phase\s*\n.*/, `## Current Phase\n${targetStage}`)
            // Reset pre-execution approval to pending
            content = content.replace(/pre-execution(\s*\|)\s*\w+(\s*\|)\s*[^|]*(\s*\|)/, `pre-execution$1 pending$2 —$3`)
            // Add blocker
            content = content.replace(/(## Blockers\s*\n- )/, `$1Rerouted to ${targetStage}: ${args.reason}\n- `)
            await Bun.write(STATE_FILE, content)
          } catch (e) {
            return `Failed to update pipeline state: ${e}`
          }

          return `Re-routing to ${args.target}. Reason: ${args.reason}
After ${args.target} completes, re-run code-review and security-scan.`
        },
      }),
    },
  }
}
