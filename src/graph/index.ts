import { type MutGraphNode, graph, sugiyama } from 'd3-dag'

import { getTask, taskIndex } from '@/data/task'

export function buildGraph() {
  const grf = graph<string, string>()
  const nodes: Record<string, MutGraphNode<string, string>> = {}
  for (const name in taskIndex.value) {
    nodes[name] = grf.node(name)
  }
  for (const name in taskIndex.value) {
    const task = getTask(taskIndex.value[name])
    if (!task) {
      continue
    }
    for (const key of ['next', 'timeout_next', 'runout_next'] as const) {
      let nxt = task[key]
      if (typeof nxt === 'string') {
        nxt = [nxt]
      } else if (!nxt) {
        nxt = []
      }
      for (const to of nxt) {
        if (name === to) {
          continue
        }
        if (name === 'Sub_DailyBadge' || to === 'Sub_DailyBadge') {
          grf.link(nodes[name], nodes[to], key)
        }
      }
    }
  }
  const layout = sugiyama().nodeSize([40, 40]).gap([20, 20])
  const { width, height } = layout(grf)
  return [grf, width, height] as const
}
