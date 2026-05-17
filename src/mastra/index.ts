import { Mastra } from "@mastra/core"

import { fillPlannerAgent } from "./agents/fill-planner"

export const mastra = new Mastra({
  agents: { fillPlannerAgent }
})
