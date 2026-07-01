import '@xyflow/react/dist/style.css'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Background, Panel, ReactFlow, useNodesInitialized } from '@xyflow/react'
import useNodes from './store/useNodes'
import type { EdgeTypes, NodeTypes } from '@xyflow/react'
import type { Program } from './types/types'
import ModuleNode, { type IModuleNode } from './components/ModuleNode'
import PeriodNode, { type IPeriodNode } from './components/PeriodNode'
import Edge, { type IEdge } from './components/Edge'
import useNodeActions from './hooks/useNodeActions'
import useLayout from './hooks/useLayout'
import type { IMenu } from './components/ContextMenu'
import ContextMenu from './components/ContextMenu'
import Controls from './components/Controls'
import InfoNode, { type IInfoNode } from './components/InfoNode'
import getLocalStorage from './utils/getLocalStorage'
import setLocalStorage from './utils/setLocalStorage'
import AcademicProgram from './domain/AcademicProgram'

const nodeTypes: NodeTypes = {
   module: ModuleNode,
   period: PeriodNode,
   info: InfoNode
}

const edgeTypes: EdgeTypes = {
   edge: Edge
}

function App() {
   const store = useNodes()
   const nodeAction = useNodeActions()

   const refPanel = useRef<HTMLDivElement>(null)
   const layout = useLayout(refPanel)

   const onNodesChange = useNodes((state) => state.onNodesChange)
   const onEdgesChange = useNodes((state) => state.onEdgesChange)

   const isNodesInitialized = useNodesInitialized()
   const [isDragging, setIsDragging] = useState(false)
   const [menu, setMenu] = useState<IMenu | null>(null)

   /**
   * Saves the state of the app in LocalStorage
   */
   useEffect(() => {
      if (!isNodesInitialized || !store.program) return
      setLocalStorage(AcademicProgram.toJSON(store.program))
   }, [store.nodes])

   /**
   * Initializes the nodes and edges
   */
   useEffect(() => {
      function initialize(program: Program) {
         const parsedProgram = AcademicProgram.fromJSON(program)

         const newNodes: (IModuleNode | IPeriodNode | IInfoNode)[] = []
         const newEdges: IEdge[] = []

         parsedProgram.periods.forEach((p) => {
            newNodes.push({
               id: `year-${p.year}`,
               type: 'period',
               position: { x: 0, y: 0 },
               data: { year: p.year, type: 'period' },
               selected: false,
               connectable: false,
               draggable: false
            })

            p.modules.forEach((mod) => {
               const requirements = [...mod.requirements.passed, ...mod.requirements.taken]

               newNodes.push({
                  id: `${mod.id}`,
                  position: { x: 0, y: 0 },
                  data: {
                     status: mod.status,
                     name: mod.name,
                     id: mod.id,
                     year: mod.year,
                     type: 'module',
                     requirements: mod.requirements,
                     canEnroll: mod.canEnroll,
                     onNodeClick: () => { nodeAction.selectNode(mod.id); setMenu(null) },
                     onNodeDoubleClick: () => { nodeAction.switchNodeStatus(mod.id); setMenu(null) }
                  },
                  type: 'module',
                  selected: false,
                  connectable: false
               })

               requirements.forEach(parent => {
                  newEdges.push({
                     id: `${mod.id}-${parent}`,
                     source: `${parent}`,
                     target: `${mod.id}`,
                     type: 'edge'
                  })
               })

            })
         })

         newNodes.push({
            id: 'info',
            position: { x: 0, y: 0 },
            data: {
               programName: program.name,
               programPlan: program.plan
            },
            type: 'info',
            selected: false,
            connectable: false,
            draggable: false
         })

         store.setProgram(parsedProgram)
         store.setNodes(newNodes)
         store.setEdges(newEdges)
      }

      const localStorage = getLocalStorage()

      if (localStorage) {
         initialize(localStorage)
         return
      }

      fetch('/correlativas.json')
         .then(async (res) => await res.json())
         .then((program: Program) => initialize(program))
         .catch((err) => console.error('Error reading JSON file: ', err))
   }, [])

   /**
   * Calculates the position of the nodes and edges.
   * This effect runs only during the first render.
   */
   useEffect(() => {
      if (!isNodesInitialized) return
      if (!store.nodes.every(n => n.position.x === 0)) return
      nodeAction.fitNodes()
      layout.fitViewport()
   }, [isNodesInitialized])

   const onNodeContextMenu = useCallback(
      (event: React.MouseEvent<Element, MouseEvent>, node: (IModuleNode | IPeriodNode | IInfoNode)) => {
         event.preventDefault()
         const pane = refPanel.current?.getBoundingClientRect()
         if (!pane || node.type === 'period' || node.type === 'info') return

         setMenu({
            id: node.id,
            top: event.clientY,
            left: event.clientX,
            node_id: node.id
         })
      },
      [setMenu],
   )

   return (
      <main className='bg-main w-screen h-screen relative'>
         <ReactFlow
            nodes={[...store.nodes]}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            zoomOnDoubleClick={false}
            edges={store.edges}
            onEdgesChange={onEdgesChange}
            fitView
            onPaneClick={() => { nodeAction.unselectNode(); setMenu(null) }}
            onMoveStart={() => { setIsDragging(true); setMenu(null) }}
            onMoveEnd={() => setIsDragging(false)}
            onNodeContextMenu={onNodeContextMenu}
         >
            <Panel position='top-center' className='w-full pointer-events-none' ref={refPanel}>
               {(store.program && !isDragging) &&
                  <Controls
                     onResetPositions={() => {
                        setMenu(null)
                        nodeAction.fitNodes()
                        nodeAction.unselectNode()
                        layout.fitViewport()
                     }}
                     onAjustView={() => {
                        setMenu(null)
                        nodeAction.fitNodes()
                        layout.fitViewport()
                     }}
                  />
               }
            </Panel>

            <Background className='opacity-30' />

            {(menu) && <ContextMenu {...menu} />}
         </ReactFlow>
      </main>
   )
}

export default App
