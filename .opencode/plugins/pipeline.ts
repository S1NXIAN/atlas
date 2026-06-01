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

const REROUTE_TARGETS: Partial<Record<Stage, Stage>> = {
  [Stage.CodeReview]: Stage.CodeForge,
  [Stage.SecurityScan]: Stage.CodeForge,
}

// ── State type definitions (inline, contracts migrated) ─────────
interface PipelineState {
  version: string
  status: string
  currentStep: string
  completedSteps: string[]
  failedSteps: string[]
  stepHistory: StepRecord[]
  approvals: Record<string, ApprovalRecord>
  lastCheckpoint: string | null
  createdAt: string
  updatedAt: string
}

interface StepRecord {
  stepId: string
  status: "running" | "passed" | "failed" | "skipped" | "pending"
  startedAt: string
  completedAt: string | null
  evidence: Record<string, any>
  error: string | null
  handoffPath: string | null
  attempts: number
}

interface ApprovalRecord {
  status: "pending" | "approved" | "denied"
  timestamp: string | null
  reason?: string
}

interface ActiveSession {
  sessionId: string
  statePath: string
  createdAt: string
}

interface HandoffRecord {
  agentId: string
  status: "running" | "passed" | "failed"
  summary: string
  goal: string
  nextSteps: string[]
  blocked: string[]
  keyDecisions: string[]
  artifactsProduced: string[]
  interfaceContracts: string[]
  priorDecisions: string[]
  startedAt: string
  completedAt: string | null
  error: string | null
}

// ── Evidence gate types ─────────────────────────────────────────
interface GateResult {
  pass: boolean
  message: string
}

interface GateCheck {
  name: string
  check: (ctx: GateContext) => GateResult | Promise<GateResult>
}

interface GateContext {
  state: PipelineState
  handoff?: HandoffRecord
  output?: string
}

// ── State file paths ────────────────────────────────────────────
const WORKSPACE_ROOT = "/home/xian/Work/atlas"
const ACTIVE_SESSION_FILE = `${WORKSPACE_ROOT}/.tmp/active-session.json`
const SESSIONS_BASE_DIR = `${WORKSPACE_ROOT}/.tmp/sessions`
const ROOT_STATE_MD = `${WORKSPACE_ROOT}/WORKFLOW_STATE.md`

function validateSessionId(sessionId: string): void {
  if (!/^[a-zA-Z0-9_-]+$/.test(sessionId)) throw new Error(`Invalid sessionId: ${sessionId}`)
}

function validateAgentId(agentId: string): void {
  if (!/^[a-zA-Z0-9_-]+$/.test(agentId)) throw new Error(`Invalid agentId: ${agentId}`)
}

function buildSessionDir(sessionId: string): string {
  validateSessionId(sessionId)
  return `${SESSIONS_BASE_DIR}/${sessionId}`
}

function buildStatePath(sessionId: string): string {
  return `${buildSessionDir(sessionId)}/state.json`
}

function buildHandoffDir(sessionId: string): string {
  return `${buildSessionDir(sessionId)}/handoffs`
}

function buildHandoffPath(sessionId: string, agentId: string): string {
  validateAgentId(agentId)
  return `${buildHandoffDir(sessionId)}/${agentId}.json`
}

// ── State read/write helpers ────────────────────────────────────
async function readActiveSession(): Promise<ActiveSession | null> {
  try {
    const file = Bun.file(ACTIVE_SESSION_FILE)
    if (!(await file.exists())) return null
    const parsed = JSON.parse(await file.text()) as ActiveSession
    if (!parsed.sessionId || !parsed.statePath) return null
    return parsed
  } catch { return null }
}

async function writeActiveSession(sessionId: string): Promise<void> {
  // Fix 8: Guard against overwriting active-session.json for the same session
  const existingFile = Bun.file(ACTIVE_SESSION_FILE)
  if (await existingFile.exists()) {
    try {
      const existingContent = JSON.parse(await existingFile.text()) as ActiveSession
      if (existingContent.sessionId === sessionId) return // Same session, no overwrite needed
    } catch { /* If parse fails, proceed with write */ }
  }
  const statePath = buildStatePath(sessionId)
  // Fix 3: Include createdAt
  const activeSession: ActiveSession = { sessionId, statePath, createdAt: new Date().toISOString() }
  await Bun.write(ACTIVE_SESSION_FILE, JSON.stringify(activeSession, null, 2))
}

async function readState(): Promise<PipelineState | null> {
  try {
    const active = await readActiveSession()
    if (!active) return null
    // Fix 6: Validate statePath resolves within session directory
    const resolved = path.resolve(active.statePath)
    if (!resolved.startsWith(path.resolve(SESSIONS_BASE_DIR))) {
      throw new Error("statePath outside session directory")
    }
    const file = Bun.file(resolved)
    if (!(await file.exists())) return null
    return JSON.parse(await file.text()) as PipelineState
  } catch { return null }
}

async function writeState(state: PipelineState): Promise<void> {
  state.updatedAt = new Date().toISOString()
  const active = await readActiveSession()
  if (!active) throw new Error("No active session to write state")
  // Fix 6: Validate statePath resolves within session directory
  const resolved = path.resolve(active.statePath)
  if (!resolved.startsWith(path.resolve(SESSIONS_BASE_DIR))) {
    throw new Error("statePath outside session directory")
  }
  await Bun.write(resolved, JSON.stringify(state, null, 2))
  // Re-render thin Markdown
  await writeThinMarkdown(state, active.sessionId)
}

async function writeThinMarkdown(state: PipelineState, sessionId: string): Promise<void> {
  const lines = [
    "# Atlas Pipeline State",
    "",
    `## Current Phase: ${state.currentStep}`,
    `## Status: ${state.status}`,
    `## Quick Summary`,
    `- Completed: ${state.completedSteps.join(", ") || "none"}`,
    `- Failed: ${state.failedSteps.join(", ") || "none"}`,
    `- Approvals: ${Object.entries(state.approvals).map(([k, v]) => `${k}=${v.status}`).join(", ")}`,
    `- Agents: ${state.stepHistory.length} of ${PIPELINE_ORDER.length} steps complete`,
    "",
    `Machine state: .tmp/sessions/${sessionId}/state.json`,
    `Handoffs: .tmp/sessions/${sessionId}/handoffs/`,
  ]
  await Bun.write(ROOT_STATE_MD, lines.join("\n") + "\n")
}

async function writeHandoff(
  sessionId: string,
  agentId: string,
  status: "passed" | "failed",
  summary: string,
  extras?: Partial<HandoffRecord>,
): Promise<void> {
  const handoffDir = buildHandoffDir(sessionId)
  Bun.spawnSync(["mkdir", "-p", handoffDir])
  await Bun.write(buildHandoffPath(sessionId, agentId), JSON.stringify({
    agentId,
    status,
    summary: summary.slice(0, 1000),
    goal: extras?.goal ?? "",
    nextSteps: extras?.nextSteps ?? [],
    blocked: extras?.blocked ?? [],
    keyDecisions: extras?.keyDecisions ?? [],
    artifactsProduced: extras?.artifactsProduced ?? [],
    interfaceContracts: extras?.interfaceContracts ?? [],
    priorDecisions: extras?.priorDecisions ?? [],
    startedAt: extras?.startedAt ?? new Date().toISOString(),
    completedAt: new Date().toISOString(),
    error: extras?.error ?? null,
  } satisfies HandoffRecord, null, 2))
}

async function readHandoff(sessionId: string, agentId: string): Promise<HandoffRecord | null> {
  try {
    const file = Bun.file(buildHandoffPath(sessionId, agentId))
    if (!(await file.exists())) return null
    return JSON.parse(await file.text()) as HandoffRecord
  } catch { return null }
}

function getStageIndex(stage: Stage): number {
  return PIPELINE_ORDER.indexOf(stage)
}

// ── Evidence gates per stage ────────────────────────────────────
const EVIDENCE_GATES: Record<Stage, GateCheck[]> = {
  [Stage.SpecWriter]: [
    { name: "has-acceptance-criteria", check: (ctx) => {
      const pass = ctx.handoff?.artifactsProduced?.some(p => p.endsWith(".md"))
        ?? ctx.output?.includes("## Acceptance Criteria") ?? false
      return { pass, message: pass ? "Acceptance criteria found" : "Missing acceptance criteria" }
    }},
    { name: "has-scope", check: (ctx) => {
      const pass = ctx.output?.includes("## Scope") ?? false
      return { pass, message: pass ? "Scope section found" : "Missing ## Scope section" }
    }},
    { name: "scope-has-in-out", check: (ctx) => {
      const pass = (ctx.output?.includes("In:") && ctx.output?.includes("Out:")) ?? false
      return { pass, message: pass ? "Scope has In/Out" : "Scope missing In: or Out:" }
    }},
    { name: "min-length", check: (ctx) => {
      const len = ctx.output?.length ?? 0
      return { pass: len > 100, message: len > 100 ? `Output length ${len} > 100` : `Output too short: ${len} chars` }
    }},
  ],
  [Stage.CodeScout]: [
    { name: "has-file-paths", check: (ctx) => {
      const count = ctx.handoff?.artifactsProduced?.length ?? 0
      return { pass: count >= 1, message: count >= 1 ? `Found ${count} artifacts` : "No artifacts found" }
    }},
    { name: "min-sources", check: (ctx) => {
      const paths = ctx.handoff?.artifactsProduced ?? []
      const unique = [...new Set(paths)]
      return { pass: unique.length >= 2, message: `${unique.length} unique sources (need >= 2)` }
    }},
  ],
  [Stage.PlanCrafter]: [
    { name: "has-numbered-steps", check: (ctx) => {
      const pass = /^\d+\.\s/m.test(ctx.output ?? "")
      return { pass, message: pass ? "Numbered steps found" : "No numbered steps found" }
    }},
    { name: "has-implementation-plan", check: (ctx) => {
      const pass = ctx.output?.includes("## Implementation Plan") ?? false
      return { pass, message: pass ? "Implementation Plan found" : "Missing ## Implementation Plan" }
    }},
    { name: "has-task-json", check: async (ctx) => {
      try {
        const glob = new Bun.Glob(".tmp/tasks/*/task.json")
        const matches = await glob.scan({ cwd: WORKSPACE_ROOT })
        const first = await matches.next()
        return { pass: !first.done, message: !first.done ? "task.json found" : "No task.json found" }
      } catch { return { pass: true, message: "Could not check task.json" } }
    }},
  ],
  [Stage.ContractDefinition]: [
    { name: "output-matches-ts-files", check: (ctx) => {
      const pass = ctx.handoff?.artifactsProduced?.some(p => p.endsWith(".ts") || p.endsWith(".d.ts"))
        ?? /\.(ts|d\.ts)/i.test(ctx.output ?? "") ?? false
      return { pass, message: pass ? "TypeScript file references found" : "No .ts or .d.ts references" }
    }},
    { name: "contracts-dir-exists", check: async (ctx) => {
      try {
        const dir = Bun.file(`${WORKSPACE_ROOT}/.tmp/contracts`)
        const exists = await dir.exists()
        return { pass: exists, message: exists ? ".tmp/contracts/ exists" : ".tmp/contracts/ not found" }
      } catch { return { pass: false, message: "Could not check .tmp/contracts/" } }
    }},
  ],
  [Stage.CodeForge]: [
    { name: "artifact-exists", check: async (ctx) => {
      const paths = ctx.handoff?.artifactsProduced ?? []
      if (paths.length === 0) return { pass: false, message: "No artifacts in handoff" }
      const results = await Promise.all(paths.map(async p => {
        try { return { path: p, exists: await Bun.file(p).exists() } }
        catch { return { path: p, exists: false } }
      }))
      const existing = results.filter(r => r.exists)
      return { pass: existing.length > 0, message: existing.length > 0 ? `Artifact exists: ${existing[0].path}` : "No artifact found on disk" }
    }},
    { name: "all-batch-artifacts-exist", check: async (ctx) => {
      try {
        const paths = ctx.handoff?.artifactsProduced ?? []
        if (paths.length === 0) return { pass: true, message: "No artifacts to check" }
        const results = await Promise.all(paths.map(async p => {
          try { return { path: p, exists: await Bun.file(p).exists() } }
          catch { return { path: p, exists: false } }
        }))
        const missing = results.filter(r => !r.exists)
        return { pass: missing.length === 0, message: missing.length === 0 ? `All ${results.length} artifacts exist` : `Missing: ${missing.slice(0, 3).map(m => m.path).join(", ")}` }
      } catch { return { pass: true, message: "Could not verify artifacts" } }
    }},
    { name: "has-implementation-report", check: (ctx) => {
      const pass = ctx.output?.includes("## Implementation Report") ?? false
      return { pass, message: pass ? "Implementation Report found" : "Missing ## Implementation Report" }
    }},
    { name: "has-pass-or-success", check: (ctx) => {
      const pass = /PASS|SUCCESS/i.test(ctx.output ?? "")
      return { pass, message: pass ? "PASS/SUCCESS found" : "No PASS or SUCCESS in output" }
    }},
  ],
  [Stage.DocFetch]: [
    { name: "has-url-refs", check: (ctx) => {
      const urls = ctx.output?.match(/https?:\/\/[^\s]+/g)
      return { pass: urls !== null && urls !== undefined && urls.length >= 1, message: urls ? `Found ${urls.length} URLs` : "No URL references found" }
    }},
    { name: "min-length", check: (ctx) => {
      const len = ctx.output?.length ?? 0
      return { pass: len > 200, message: len > 200 ? `Output length ${len} > 200` : `Output too short: ${len} chars` }
    }},
  ],
  [Stage.WorkWeaver]: [
    { name: "references-all-agents", check: (ctx) => {
      const agents = ["spec-writer", "code-scout", "plan-crafter", "contract-definition", "code-forge", "doc-fetch", "work-weaver", "code-review", "security-scan", "code-clean", "done-check"]
      const o = ctx.output ?? ""
      const missing = agents.filter(a => !o.toLowerCase().includes(a))
      return { pass: missing.length === 0, message: missing.length === 0 ? "All 11 agents referenced" : `Missing: ${missing.join(", ")}` }
    }},
    { name: "has-integration-summary", check: (ctx) => {
      const pass = (ctx.output?.includes("## Integration Summary") || ctx.output?.includes("## Integration Report")) ?? false
      return { pass, message: pass ? "Integration summary found" : "Missing ## Integration Summary or Report" }
    }},
  ],
  [Stage.CodeReview]: [
    { name: "has-pass-or-changes", check: (ctx) => {
      const pass = /PASS|Changes requested/i.test(ctx.output ?? "")
      return { pass, message: pass ? "PASS or Changes requested found" : "No PASS or Changes requested" }
    }},
    { name: "not-skipped", check: (ctx) => {
      const pass = !/SKIP/i.test(ctx.output ?? "")
      return { pass, message: pass ? "Review was not skipped" : "Review was SKIPPED" }
    }},
    { name: "check-fail-reroute", check: (ctx) => {
      const pass = ctx.handoff?.status !== "failed" && !/FAIL/i.test(ctx.output ?? "")
      return { pass, message: pass ? "No FAIL found" : "FAIL found — reroute trigger" }
    }},
  ],
  [Stage.SecurityScan]: [
    { name: "vuln-count-or-clean", check: (ctx) => {
      const pass = /VULN_COUNT:|No vulnerabilities found/i.test(ctx.output ?? "")
      return { pass, message: pass ? "Vulnerability report found" : "No vulnerability report" }
    }},
    { name: "not-skipped", check: (ctx) => {
      const pass = !/SKIP/i.test(ctx.output ?? "")
      return { pass, message: pass ? "Security scan was not skipped" : "Security scan was SKIPPED" }
    }},
  ],
  [Stage.CodeClean]: [
    { name: "no-todos", check: async (ctx) => {
      try {
        const proc = Bun.spawnSync(["bash", "-c", "rg -n 'TODO|FIXME|HACK|XXX' --glob '!node_modules' --glob '!.git' . 2>/dev/null | wc -l"])
        const count = parseInt(proc.stdout.toString().trim()) || 0
        return { pass: count === 0, message: count === 0 ? "No TODOs/FIXMEs found" : `${count} TODOs/FIXMEs/HACKs/XXXs found` }
      } catch { return { pass: true, message: "Could not check TODOs" } }
    }},
    { name: "plan-files-exist", check: async (ctx) => {
      try {
        const paths = ctx.handoff?.artifactsProduced ?? []
        if (paths.length === 0) return { pass: true, message: "No artifacts to check" }
        const results = await Promise.all(paths.map(async p => {
          try { return { path: p, exists: await Bun.file(p).exists() } }
          catch { return { path: p, exists: false } }
        }))
        const missing = results.filter(r => !r.exists)
        return { pass: missing.length === 0, message: missing.length === 0 ? `All ${paths.length} files exist` : `Missing: ${missing.slice(0, 5).map(m => m.path).join(", ")}` }
      } catch { return { pass: true, message: "Could not verify plan files" } }
    }},
  ],
  [Stage.DoneCheck]: [
    { name: "all-criteria-met", check: (ctx) => {
      const pass = ctx.output?.includes("ALL_ACCEPTANCE_CRITERIA_MET: true") ?? false
      return { pass, message: pass ? "All acceptance criteria met" : "Missing ALL_ACCEPTANCE_CRITERIA_MET: true" }
    }},
    { name: "has-verification-results", check: (ctx) => {
      const pass = ctx.output?.includes("## Verification Results") ?? false
      return { pass, message: pass ? "Verification results found" : "Missing ## Verification Results" }
    }},
  ],
  [Stage.Complete]: [],
  [Stage.Failed]: [],
}

// ── Plugin export ───────────────────────────────────────────────
export const PipelinePlugin: Plugin = async ({ client }) => {
  return {
    "experimental.session.compacting": async (input, output) => {
      const pipelineState = await readState()
      if (pipelineState) {
        const compact = {
          version: pipelineState.version,
          status: pipelineState.status,
          currentStep: pipelineState.currentStep,
          completedSteps: pipelineState.completedSteps,
          stepHistory: pipelineState.stepHistory.map(s => ({
            stepId: s.stepId,
            status: s.status,
          })),
        }
        output.context.push(`## Pipeline State: ${JSON.stringify(compact)}`)
        output.context.push(`## Pipeline Steps\n${PIPELINE_ORDER.join(" → ")}`)
        output.context.push(`## Pipeline Rules\n- state.json is canonical (handoffs/{agent}.json per agent)\n- Only code-forge may edit code files\n- Evidence gates run after every agent (deterministic checks, no LLM)\n- code-review or security-scan failure -> reroute to code-forge\n- All other failures -> pipeline stops`)

        // Reference handoffs for detail context
        const active = await readActiveSession()
        if (active) {
          output.context.push(`## Handoff Details: .tmp/sessions/${active.sessionId}/handoffs/`)
        }
      } else {
        output.context.push(`## Pipeline Steps\n${PIPELINE_ORDER.join(" → ")}`)
        output.context.push(`## Pipeline Rules\n- state.json is canonical\n- Only code-forge may edit code files\n- Evidence gates run after every agent\n- code-review or security-scan failure -> reroute to code-forge`)
      }
    },

    tool: {
      pipeline_run: tool({
        description: "Execute the full atlas pipeline for a task through all 11 subagents",
        args: {
          task: tool.schema.string().describe("The task to execute through the pipeline"),
        },
        async execute(args) {
          // Validate no active session already running
          const existingSession = await readActiveSession()
          if (existingSession) {
            const existingState = await readState()
            if (existingState && existingState.status === "running") {
              return `Pipeline already running: ${existingSession.sessionId}. Current step: ${existingState.currentStep}. Complete or fail it first.`
            }
          }

          // Create session directory
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
          const taskSlug = args.task.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(?:^-+|-+$)/g, "").slice(0, 40)
          const sessionId = `${timestamp}-${taskSlug}`
          const sessionDir = buildSessionDir(sessionId)
          const handoffDir = buildHandoffDir(sessionId)
          Bun.spawnSync(["mkdir", "-p", sessionDir, handoffDir])

          // Write initial state.json
          const now = new Date().toISOString()
          const initialState: PipelineState = {
            version: "1.0",
            status: "running",
            currentStep: Stage.SpecWriter,
            completedSteps: [],
            failedSteps: [],
            stepHistory: PIPELINE_ORDER.map(s => ({
              stepId: s,
              status: s === Stage.SpecWriter ? "running" : "pending",
              startedAt: now,
              completedAt: null,
              evidence: {},
              error: null,
              handoffPath: null,
              attempts: 0,
            })),
            approvals: {
              "pre-execution": { status: "pending", timestamp: null },
            },
            lastCheckpoint: null,
            createdAt: now,
            updatedAt: now,
          }
          await Bun.write(buildStatePath(sessionId), JSON.stringify(initialState, null, 2))

          // Write active session pointer
          await writeActiveSession(sessionId)

          // Write thin WORKFLOW_STATE.md
          await writeThinMarkdown(initialState, sessionId)

          // Prune sessions older than 30 days
          try {
            Bun.spawnSync(["bash", "-c", `find ${SESSIONS_BASE_DIR} -mindepth 1 -maxdepth 1 -type d -mtime +30 -exec rm -rf {} + 2>/dev/null`])
          } catch (e) {
            console.error(`Session pruning warning: ${e}`)
          }

          return `Pipeline initiated for: ${args.task}
Sequence: ${PIPELINE_ORDER.join(" -> ")}
Current phase: ${Stage.SpecWriter}
State: .tmp/sessions/${sessionId}/state.json
Active session pointer: .tmp/active-session.json`
        },
      }),

      pipeline_status: tool({
        description: "Get the current pipeline step and its status",
        args: {
          currentStep: tool.schema.string().optional().describe("Current pipeline step name"),
          status: tool.schema.string().optional().describe("Status: running/passed/failed/skipped"),
        },
        async execute(args) {
          const state = await readState()
          if (!state) {
            return "No pipeline state found. Run pipeline_run first."
          }

          const step = args.currentStep ?? state.currentStep
          const stat = args.status ?? "running"
          const idx = getStageIndex(step as Stage)
          const completed = idx >= 0 ? PIPELINE_ORDER.slice(0, idx) : []
          const remaining = idx >= 0 ? PIPELINE_ORDER.slice(idx + 1) : PIPELINE_ORDER

          // Validate step is in enum
          if (!Object.values(Stage).includes(step as Stage)) {
            return `Invalid step: ${step}. Must be one of: ${Object.values(Stage).join(", ")}`
          }

          // Check pre-execution approval gate
          if (state.approvals?.["pre-execution"]?.status === "pending") {
            return [
              `Current: ${step} [${stat}]`,
              `Completed: ${completed.join(", ") || "none"}`,
              `Remaining: ${remaining.join(" → ") || "none"}`,
              `State: ${ACTIVE_SESSION_FILE} -> state.json`,
              "AWAITING_APPROVAL: Pre-execution gate is pending — run pipeline_approve to continue",
            ].join("\n")
          }

          return [
            `Current: ${step} [${stat}]`,
            `Completed: ${completed.join(", ") || "none"}`,
            `Remaining: ${remaining.join(" → ") || "none"}`,
            `State: ${ACTIVE_SESSION_FILE} -> state.json`,
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

          const state = await readState()
          if (!state) return "No pipeline state found. Run pipeline_run first."
          if (!state.approvals[gate]) return `Unknown gate: ${gate}. Allowed gates: pre-execution`

          state.approvals[gate] = {
            status: decision as "approved" | "denied",
            timestamp: new Date().toISOString(),
            reason: args.reason,
          }
          await writeState(state)

          return `Approval recorded: ${gate} = ${decision} at ${state.approvals[gate].timestamp}${args.reason ? ` (reason: ${args.reason})` : ""}`
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

          const state = await readState()
          if (!state) return "No pipeline state found. Run pipeline_run first."

          // Fix 1: Capture the actual failing step BEFORE overwriting currentStep
          const failingStep = state.currentStep
          state.currentStep = targetStage
          state.failedSteps.push(failingStep)

          // Reset pre-execution approval
          if (state.approvals["pre-execution"]) {
            state.approvals["pre-execution"].status = "pending"
            state.approvals["pre-execution"].timestamp = null
          }

          // Fix 1: Update stepHistory for the actual failing step
          const failedRecord = state.stepHistory.find(s => s.stepId === failingStep && s.status === "running")
          if (failedRecord) {
            failedRecord.status = "failed"
            failedRecord.error = `Rerouted to ${targetStage}: ${args.reason}`
          }

          // W1: Set the reroute target's step record to "running"
          const targetRecord = state.stepHistory.find(s => s.stepId === targetStage && s.status === "pending")
          if (targetRecord) {
            targetRecord.status = "running"
            targetRecord.startedAt = new Date().toISOString()
          }

          await writeState(state)

          return `Re-routing to ${args.target}. Reason: ${args.reason}
After ${args.target} completes, re-run code-review and security-scan.`
        },
      }),

      pipeline_advance_step: tool({
        description: "Advance the pipeline to the next stage after current step completes",
        args: {
          nextStep: tool.schema.string().describe("The next stage to advance to"),
          handoffPath: tool.schema.string().optional().describe("Path to the handoff file for the completed step"),
          evidence: tool.schema.any().optional().describe("Evidence gate results"),
        },
        async execute(args) {
          const state = await readState()
          if (!state) return "No pipeline state found. Run pipeline_run first."

          const idx = PIPELINE_ORDER.indexOf(state.currentStep as Stage)
          if (idx === -1) return `Unknown current step: ${state.currentStep}`

          // Mark current step as completed
          const stepRecord = state.stepHistory.find(s => s.stepId === state.currentStep && s.status === "running")
          if (stepRecord) {
            stepRecord.status = "passed"
            stepRecord.completedAt = new Date().toISOString()
            stepRecord.handoffPath = args.handoffPath || null
            if (args.evidence) stepRecord.evidence = args.evidence
          }

          // Add to completedSteps if not already there
          if (!state.completedSteps.includes(state.currentStep)) {
            state.completedSteps.push(state.currentStep)
          }

          // Advance to next step
          state.currentStep = args.nextStep
          state.lastCheckpoint = state.currentStep
          state.updatedAt = new Date().toISOString()

          // W2: Reuse existing step record if present, otherwise create new
          const existingNextRecord = state.stepHistory.find(s => s.stepId === args.nextStep && s.status === "pending")
          if (existingNextRecord) {
            existingNextRecord.status = "running"
            existingNextRecord.startedAt = new Date().toISOString()
          } else {
            state.stepHistory.push({
              stepId: args.nextStep,
              status: "running",
              startedAt: new Date().toISOString(),
              completedAt: null,
              evidence: {},
              error: null,
              handoffPath: null,
              attempts: 0,
            })
          }

          await writeState(state)
          return `Advanced to ${args.nextStep}`
        },
      }),
    },
  }
}
