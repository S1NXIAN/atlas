export interface AgentDefinition {
  name: string
  description: string
  prompt: string
  tools?: string[]
}

export const BUILTIN_AGENTS: Record<string, AgentDefinition> = {
  oracle: {
    name: "oracle",
    description: "Architecture and debugging specialist",
    prompt: "You are Oracle. Think deeply about architecture and complex problems.",
  },
  librarian: {
    name: "librarian",
    description: "Documentation and research specialist",
    prompt: "You are Librarian. Read docs and source code to find answers.",
  },
  explore: {
    name: "explore",
    description: "Fast codebase search specialist",
    prompt: "You are Explore. Rapidly search and understand codebases.",
  },
}
