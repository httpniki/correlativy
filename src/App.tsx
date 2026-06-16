import '@xyflow/react/dist/style.css'

import { useCallback, useEffect, useRef, useState } from 'react'
import { applyEdgeChanges, applyNodeChanges, Background, Panel, ReactFlow, useNodesInitialized, useReactFlow } from '@xyflow/react'
import useNodes from './store/useNodes'
import type { Edge as EdgeType, EdgeTypes, NodeTypes, OnEdgesChange, OnNodesChange } from '@xyflow/react'
import type { Program } from './types/types'
import ModuleNode, { type IModuleNode } from './components/ModuleNode'
import PeriodNode, { type IPeriodNode } from './components/PeriodNode'
import Header from './components/Header'
import setLocalStorage from './utils/setLocalStorage'
import getLocalStorage from './utils/getLocalStorage'
import Edge from './components/Edge'

const nodeTypes: NodeTypes = {
   module: ModuleNode,
   period: PeriodNode
}

const edgeTypes: EdgeTypes = {
   edge: Edge
}

function App() {
   const {
      moduleNodes,
      periodNodes,
      edges,
      program,
      setProgram,
      setNodes,
      setEdges,
      getAllNodes
   } = useNodes((state) => state)
   const { fitView, updateNode, updateEdge } = useReactFlow<(IModuleNode | IPeriodNode)>()
   const isNodesInitialized = useNodesInitialized()
   const [isDragging, setIsDragging] = useState(false)
   const refPanel = useRef<HTMLDivElement>(null)

   /**
   * Saves the state of the app in LocalStorage
   */
   useEffect(() => {
      if (!isNodesInitialized || !program) return
      const nodes = getAllNodes()
      setLocalStorage({ program, nodes, edges })
   }, [moduleNodes, periodNodes])

   useEffect(() => {
      const store = getLocalStorage()

      if (store) {
         setNodes(store.nodes)
         setEdges(store.edges)
         setProgram(store.program)
         return
      }

      fetch('/correlativas.json')
         .then(async (res) => await res.json())
         .then((program: Program) => {
            const newNodes: (IModuleNode | IPeriodNode)[] = []
            const newEdges: EdgeType[] = []

            program.periods.forEach((p) => {
               newNodes.push({
                  id: `year-${p.year}`,
                  type: 'period',
                  position: { x: 0, y: 0 },
                  data: { year: p.year, type: 'period' },
                  selected: false,
                  connectable: false,
                  draggable: false
               })

               for (const module of p.modules) {
                  const requirements = [...module.requirements.passed, ...module.requirements.taken]
                  const hasRequirements = requirements.length > 0

                  newNodes.push({
                     id: `${module.id}`,
                     position: { x: 0, y: 0 },
                     data: {
                        status: module.status,
                        name: module.name,
                        id: module.id,
                        year: module.year,
                        type: 'module',
                        requirements: module.requirements,
                        canEnroll: !hasRequirements
                     },
                     type: 'module',
                     selected: false,
                     connectable: false
                  })

                  requirements.forEach(parent => {
                     newEdges.push({
                        id: `${module.id}-${parent}`,
                        source: `${parent}`,
                        target: `${module.id}`,
                        type: 'edge'
                     })
                  })
               }
            })

            setProgram(program)
            setNodes(newNodes)
            setEdges(newEdges)
         })
         .catch((err) => console.error('Error reading JSON file: ', err))
   }, [])

   function fitViewport() {
      const PANEL_HEIGHT = refPanel.current?.getBoundingClientRect().height ?? 0
      fitView({ padding: { top: `${PANEL_HEIGHT}px`, left: '40px', right: '40px', bottom: '40px' } })
   }

   function calculatePositionY() {
      const NODE_VERTICALLY_SPACING = 150

      periodNodes.forEach((node, index) => {
         node.position.y = 0 + (NODE_VERTICALLY_SPACING * index)
         updateNode(node.id, { position: node.position })
      })

      moduleNodes.forEach(node => {
         const periodNode = periodNodes.find(n => n.data.year === node.data.year)

         if (!periodNode) throw new Error('PeriodNode not found')
         if (!periodNode?.measured?.height) throw new Error('PeriodNode height is not defined')
         if (!node.measured?.height) throw new Error('ModuleNode height is not defined')

         const labelCenterY = periodNode.position.y + (periodNode.measured.height / 2)
         const nodeCenterY = node.position.y + (node.measured.height / 2)

         node.position.y = node.position.y - nodeCenterY + labelCenterY

         updateNode(node.id, { position: node.position })
      })
   }

   function calculatePositionX() {
      const NODE_SPACING = 10
      const EXTRA_LABEL_SPACING = 20

      program?.periods.forEach((period) => {
         const periodNode = periodNodes.find(n => n.data.year === period.year)

         if (!periodNode) throw new Error('PeriodNode not found')
         if (typeof periodNode?.measured?.width !== 'number') throw new Error('PeriodNode width is not defined')

         let prevNodePosX = periodNode.position.x + EXTRA_LABEL_SPACING
         let prevNodeWidth = periodNode.measured.width

         period.modules.forEach((module) => {
            const node = moduleNodes.find(n => n.id === `${module.id}`)

            if (!node) throw new Error('ModuleNode not found')
            if (typeof node.measured?.width !== 'number') throw new Error('ModuleNode width is not defined')

            node.position.x = prevNodePosX + prevNodeWidth + NODE_SPACING
            prevNodePosX = node.position.x
            prevNodeWidth = node.measured.width

            updateNode(node.id, { position: node.position })
         })
      })
   }

   /**
   * Calculates the position of the nodes and edges.
   * This effect runs only during the first render when the state doesn't exist in LocalStorage.
   */
   useEffect(() => {
      if (!isNodesInitialized) return
      if (!moduleNodes.every(n => n.position.x === 0)) return
      calculatePositionX()
      calculatePositionY()
      fitViewport()
   }, [isNodesInitialized])

   const onNodesChange: OnNodesChange<(IModuleNode | IPeriodNode)> = useCallback(
      (changes) => setNodes(applyNodeChanges(changes, getAllNodes())),
      [moduleNodes, periodNodes, setNodes, getAllNodes]
   )

   const onEdgesChange: OnEdgesChange<EdgeType> = useCallback(
      (changes) => setEdges(applyEdgeChanges(changes, edges)),
      [edges, setEdges]
   )

   function resetSelection() {
      moduleNodes.forEach(node => updateNode(node.id, { style: { opacity: 1 } }))
      edges.forEach(edge => updateEdge(edge.id, { hidden: false, selected: false }))
   }

   return (
      <main className='bg-main w-screen h-screen relative'>
         <ReactFlow
            nodes={[...moduleNodes, ...periodNodes]}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            zoomOnDoubleClick={false}
            edges={edges}
            onEdgesChange={onEdgesChange}
            fitView
            onPaneClick={resetSelection}
            onMoveStart={() => setIsDragging(true)}
            onMoveEnd={() => setIsDragging(false)}
         >
            <Panel position='top-center' className='w-full pointer-events-none' ref={refPanel}>
               {(program) &&
                   <Header
                      programName={program.name}
                      programPlan={program.plan}
                      hidden={isDragging}
                      onResetPositions={() => {
                         calculatePositionY()
                         calculatePositionX()
                         resetSelection()
                         fitViewport()
                      }}
                      onFitView={() => {
                         resetSelection()
                         fitViewport()
                      }}
                   />
               }
            </Panel>

            <Background className='opacity-30' />
         </ReactFlow>
      </main>
   )
}

export default App
