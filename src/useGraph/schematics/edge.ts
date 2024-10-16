import type { GEdge, GNode } from '../types'
import type { Arrow, UTurnArrow } from '@/shapes/types'
import { getValue, getFromToNodes } from '../useGraphHelpers'
import type { GraphOptions } from '../useGraphBase'
import { getLargestAngularSpace } from '@/shapes/helpers'

export const getEdgeSchematic = (edge: GEdge, nodes: GNode[], edges: GEdge[], options: GraphOptions) => {
  const { from, to } = getFromToNodes(edge, nodes)

  const isBidirectional = edges.some(e => e.from === to.label && e.to === from.label)
  const isSelfDirecting = to === from

  const nodeSizeVal = getValue(options.nodeSize, to) + 10

  const angle = Math.atan2(to.y - from.y, to.x - from.x);

  const epiCenter = {
    x: to.x - nodeSizeVal * Math.cos(angle),
    y: to.y - nodeSizeVal * Math.sin(angle),
  }

  const start = { x: from.x, y: from.y }
  const end = epiCenter

  const lineSpacing = 12

  if (isBidirectional) {
    start.x += Math.cos(angle + Math.PI / 2) * lineSpacing
    start.y += Math.sin(angle + Math.PI / 2) * lineSpacing

    end.x += Math.cos(angle + Math.PI / 2) * lineSpacing
    end.y += Math.sin(angle + Math.PI / 2) * lineSpacing
  }

  const largestAngularSpace = getLargestAngularSpace(start, edges
    .filter((e) => (e.from === from.label || e.to === to.label) && e.from !== e.to)
    .map((e) => {
      const { from: fromNode, to: toNode } = getFromToNodes(e, nodes)
      return from.id === fromNode.id ? { x: toNode.x, y: toNode.y } : { x: fromNode.x, y: fromNode.y }
    })
  )

  const selfDirctedEdgeLine: UTurnArrow = {
    spacing: lineSpacing,
    center: { x: from.x, y: from.y },
    upDistance: 80,
    downDistance: 25,
    angle: largestAngularSpace,
    lineWidth: getValue(options.edgeWidth, edge),
    color: getValue(options.edgeColor, edge)
  };

  const edgeLine: Arrow = {
    start,
    end,
    color: getValue(options.edgeColor, edge),
    width: getValue(options.edgeWidth, edge),
  }

  return isSelfDirecting ? selfDirctedEdgeLine : edgeLine
}