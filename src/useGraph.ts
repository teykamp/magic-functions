import { ref, onMounted, watch, type Ref } from 'vue'

export type GraphOptions = {
  nodeSize: number,
  nodeBorderSize: number,
  nodeColor: string,
  nodeBorderColor: string,
  nodeText: (node: Node) => string,
  nodeTextSize: number,
  nodeTextColor: string,
  edgeColor: string,
  edgeWidth: number
}

export type Node = {
  id: number,
  x: number,
  y: number,
}

export type Edge = {
  to: number,
  from: number,
}

export const useGraph = (canvas: Ref<HTMLCanvasElement>, options: Partial<GraphOptions> = {}) => {

  const {
    nodeSize = 35,
    nodeBorderSize = 8,
    nodeColor = 'white',
    nodeBorderColor = 'black',
    nodeText = (node: Node) => node.id.toString(),
    nodeTextSize = 24,
    nodeTextColor = 'black',
    edgeColor = 'black',
    edgeWidth = 10,
  } = options

  const nodes = ref<Node[]>([])
  const edges = ref<Edge[]>([])

  const drawNode = (ctx: CanvasRenderingContext2D, node: Node) => {
    // draw node
    ctx.beginPath()
    ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2)
    ctx.fillStyle = nodeColor
    ctx.fill()

    // draw border
    ctx.strokeStyle = nodeBorderColor
    ctx.lineWidth = nodeBorderSize
    ctx.stroke()
    ctx.closePath()

    // draw text label
    ctx.font = `bold ${nodeTextSize}px Arial`
    ctx.fillStyle = nodeTextColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(nodeText(node), node.x, node.y)
  }

  const drawEdge = (ctx: CanvasRenderingContext2D, edge: Edge) => {
    const from = nodes.value.find(node => node.id === edge.from)
    const to = nodes.value.find(node => node.id === edge.to)

    if (!from || !to) return

    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.strokeStyle = edgeColor
    ctx.lineWidth = edgeWidth
    ctx.stroke()
    ctx.closePath()
  }

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
    edges.value.forEach(edge => drawEdge(ctx, edge))
    nodes.value.forEach(node => drawNode(ctx, node))
  }

  onMounted(() => {
    const ctx = canvas.value.getContext('2d')
    if (ctx) {
      draw(ctx)
    }

    canvas.value.addEventListener('dblclick', (ev) => {
      const { offsetX, offsetY } = ev
      addNode({ x: offsetX, y: offsetY })
    })
  })

  const addNode = (node: Partial<Node>) => {
    nodes.value.push({
      id: node.id || nodes.value.length + 1,
      x: node.x || 100,
      y: node.y || 100,
    })
  }

  const moveNode = (id: number, x: number, y: number) => {
    const node = nodes.value.find(node => node.id === id)
    if (node) {
      node.x = x
      node.y = y
    }
  }

  const getNode = (id: number) => {
    return nodes.value.find(node => node.id === id)
  }

  const getNodeByCoordinates = (x: number, y: number) => {
    return nodes.value.find(node => {
      return Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2) < nodeSize
    })
  }

  const removeNode = (id: number) => {
    const index = nodes.value.findIndex(node => node.id === id)
    if (index !== -1) {
      nodes.value.splice(index, 1)
    }

    edges.value = edges.value.filter(edge => edge.from !== id && edge.to !== id)
  }

  const addEdge = (edge: Edge) => {
    edges.value.push(edge)
  }

  const removeEdge = (edge: Edge) => {
    edges.value = edges.value.filter(e => e.from !== edge.from || e.to !== edge.to)
  }

  watch(nodes, () => {
    const ctx = canvas.value.getContext('2d')
    if (ctx) {
      draw(ctx)
    }
  }, { deep: true })

  watch(edges, () => {
    const ctx = canvas.value.getContext('2d')
    if (ctx) {
      draw(ctx)
    }
  }, { deep: true })

  return {
    nodes,
    edges,
    addNode,
    moveNode,
    getNode,
    getNodeByCoordinates,
    removeNode,
    addEdge,
    removeEdge,
  }
}

export const useDraggableGraph = (canvas: Ref<HTMLCanvasElement>, options: Partial<GraphOptions> = {}) => {

  const graph = useGraph(canvas, options)
  const nodeBeingDragged = ref<Node | null>(null)

  const beginDrag = (ev: MouseEvent) => {
    const { offsetX, offsetY } = ev;
    const node = graph.getNodeByCoordinates(offsetX, offsetY);
    if (node) {
      nodeBeingDragged.value = node;
    }
  }

  const endDrag = () => {
    nodeBeingDragged.value = null;
  }

  const drag = (ev: MouseEvent) => {
    if (!nodeBeingDragged.value) return
    const { offsetX: x, offsetY: y } = ev
    const { id } = nodeBeingDragged.value
    graph.moveNode(id, x, y)
  }

  onMounted(() => {
    canvas.value.addEventListener('mousedown', beginDrag)
    canvas.value.addEventListener('mouseup', endDrag)
    canvas.value.addEventListener('mousemove', drag)
  })

  return graph
}