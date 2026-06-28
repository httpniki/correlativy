import { useReactFlow, useStore } from "@xyflow/react"
import type { IModuleNode } from "../components/ModuleNode"
import type { IPeriodNode } from "../components/PeriodNode"
import type { AcademicModule } from "../domain/AcademicModule"
import useNodes from "../store/useNodes"
import NodeService from "../services/NodeService"
import type { IInfoNode } from "../components/InfoNode"

export default function useNodeActions() {
   const { updateNode, updateEdge, getNodes, getEdges, getNodeConnections } = useReactFlow<(IModuleNode | IPeriodNode | IInfoNode)>()
   const getProgram = useNodes((state) => state.getProgram)
   const viewportWidth = useStore((state) => state.width)

   function selectNode(id: string) {
      const nodes = getNodes().filter(n => n.type === 'module')
      const edges = getEdges()
      const connections = getNodeConnections({ nodeId: id })

      edges.forEach(conn => {
         const isSource = conn.source === id
         const isTarget = conn.target === id

         if (!isSource && !isTarget) {
            updateEdge(conn.id, { hidden: true })
            return
         }

         updateEdge(conn.id, { hidden: false })
      })

      nodes.forEach((node) => {
         if (node.id === id) {
            updateNode(node.id, { style: { opacity: 1 } })
            return
         }

         const isConnected = connections.some(c => c.source === node.id || c.target === node.id)

         if (isConnected) {
            updateNode(node.id, { style: { opacity: 1 } })
            return
         }

         updateNode(node.id, { style: { opacity: 0.5 } })
      })
   }

   function unselectNode() {
      const nodes = getNodes().filter(n => n.type === 'module' && n.style?.opacity === 0.5)
      const edges = getEdges().filter(e => e.hidden === true)

      nodes.forEach(node => {
         updateNode(node.id, { style: { opacity: 1 } })
      })

      edges.forEach(edge => {
         updateEdge(edge.id, { hidden: false, selected: false })
      })
   }

   function switchNodeStatus(node_id: string) {
      const program = getProgram()
      const nodes = getNodes()
      const edges = getEdges()
      let academicModule: AcademicModule | undefined

      const node = nodes.find(n => n.id === node_id) as IModuleNode
      if (!program) throw new Error('Program not found')

      program.periods.forEach(p => {
         const mod = p.modules.find(m => m.id === node_id)
         if (!mod) return
         academicModule = mod
      })

      if (!academicModule) throw new Error(`AcademicModule ${node_id} not found`)
      if (!node) throw new Error(`Node "${academicModule.name}" not found`)

      const success = program.processModule(academicModule)
      if (!success) return

      updateNode(node_id, { data: { ...node.data, status: academicModule.status, canEnroll: academicModule.canEnroll } })

      const processNextPeriod = (currentNode: IModuleNode) => {
         const connections = edges.filter(e => e.source === currentNode.id)

         connections.forEach((connection) => {
            const node = nodes.find(n => n.id === connection.target) as IModuleNode
            const period = program.periods.find(p => p.year === node?.data.year)
            const mod = period?.modules.find(m => m.id === node.data.id)

            if (!node) return
            if (!period) throw new Error(`Period ${node?.data.year} not found`)
            if (!mod) throw new Error(`Module ${node.data.id} not found`)

            node.data.canEnroll = mod.canEnroll
            node.data.status = mod.status

            updateNode(node.id, { data: node.data })
            processNextPeriod(node)
         })
      }

      processNextPeriod(node)
   }

   function fitNodes() {
      const nodes = getNodes()
      const periodNodes = nodes.filter(n => n.type === 'period')
      const moduleNodes = nodes.filter(n => n.type === 'module')
      const infoNode = nodes.find(n => n.type === 'info')
      const program = getProgram()

      if (!program) throw new Error('Program not found')
      if (!infoNode) throw new Error('Info node not found')

      infoNode.position.x = ((infoNode.width ?? 0) / 2) + (viewportWidth / 2)
      infoNode.position.y = (infoNode?.height ?? 0) - 210

      updateNode(infoNode.id, { position: infoNode.position })

      program.periods.forEach((period) => {
         const pNode = periodNodes.find(n => n.data.year === period.year)

         if (!pNode) throw new Error('PeriodNode not found')

         pNode.position.x = NodeService.calculatePositionX(null)
         pNode.position.y = NodeService.calculatePositionY(pNode)
         updateNode(pNode.id, { position: pNode.position })

         let prevNode: IPeriodNode | IModuleNode = pNode

         period.modules.forEach((module) => {
            const node = moduleNodes.find(n => n.id === module.id)
            if (!node) throw new Error('Node not found')

            node.position.x = NodeService.calculatePositionX(prevNode ?? pNode)
            node.position.y = NodeService.calculatePositionY(node)

            updateNode(node.id, { position: node.position })
            prevNode = node
         })
      })
   }

   return {
      fitNodes,
      selectNode,
      unselectNode,
      switchNodeStatus
   }
}
