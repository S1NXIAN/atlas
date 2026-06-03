/**
 * Background agent dispatch - simplified from Oh My OpenCode pattern.
 * Allows the main agent to spawn subagents for independent tasks.
 */

export interface BackgroundTask {
  id: string
  agent: string
  prompt: string
  status: "pending" | "running" | "completed" | "failed"
  result?: string
  error?: string
}

const tasks = new Map<string, BackgroundTask>()

export function dispatchTask(agent: string, prompt: string): string {
  const id = `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  tasks.set(id, { id, agent, prompt, status: "pending" })
  return id
}

export function getTaskResult(id: string): BackgroundTask | undefined {
  return tasks.get(id)
}

export function listTasks(): BackgroundTask[] {
  return Array.from(tasks.values())
}
