import { type NodeProps, type Node, Position, Handle, useReactFlow } from "@xyflow/react"
import type { Module, NodeData } from "../types/types"
import changeModuleStatus from "../utils/changeModuleStatus"
import checkEnrollment from "../utils/checkEnrollment"
import useNodes from "../store/useNodes"
import { useRef } from "react"

type ModuleNodeData = {
   [key in keyof Module]: Module[key]
} & {
   [key in keyof NodeData]: NodeData[key]
} & {
   canEnroll: boolean
}

export type IModuleNode = Node<ModuleNodeData, 'module'>

export default function ModuleNode({ id, data }: NodeProps<IModuleNode>) {
   const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
   const { updateNodeData, getNodeConnections, updateEdge, updateNode } = useReactFlow()
   const { moduleNodes } = useNodes((state) => state)

   function verifyTargetEnrollment(node_id: IModuleNode['id'], allNodes: IModuleNode[]) {
      let nodes = allNodes
      const connections = getNodeConnections({ nodeId: node_id })
      const targetNodes = connections.map(c => nodes.find(el => c.target === el.id)).filter(n => !!n)

      targetNodes.forEach(node => {
         const isEnrolled = checkEnrollment(node.id, nodes)
         node.data.canEnroll = isEnrolled
         node.data.status = isEnrolled ? node.data.status : 'Pendiente'

         nodes = nodes.map(n => n.id === node.id ? node : n)
         updateNodeData(node.id, { data: node.data })
      })

      connections.forEach(connection => {
         if (connection.target === node_id) return
         verifyTargetEnrollment(connection.target, nodes)
      })
   }

   function propagateSelection(node_id: IModuleNode['id']) {
      const connections = getNodeConnections({ nodeId: node_id })

      moduleNodes.forEach(node => {
         if (!connections.some(c => c.target === node.id) && !connections.some(c => c.source === node.id)) {
            getNodeConnections({ nodeId: node.id }).forEach(connection => {
               updateEdge(connection.edgeId, { hidden: true })
            })

            updateNode(node.id, { data: node.data, style: { opacity: 0.5 } })
         }

         if (connections.some(c => c.source === node.id)) {
            const edge = connections.find(c => c.source === node.id)
            if (!edge) throw new Error(`Edge not found for source node "${node.id}"`)

            updateNode(node.id, { style: { opacity: 1 } })
            updateEdge(edge.edgeId, { hidden: false, selected: false })
         }

         if (connections.some(c => c.target === node.id)) {
            const edge = connections.find(c => c.target === node.id)

            if (!edge) throw new Error(`Edge not found for target node "${node.id}"`)

            updateEdge(edge.edgeId, { hidden: false, selected: false })
            updateNode(node.id, { style: { opacity: 1 } })
         }
      })
   }

   function updateNodeStatus() {
      let nodes = moduleNodes
      const node = moduleNodes.find(n => n.id === id)

      const isEnrolled = checkEnrollment(id, nodes)

      if (!node) throw new Error(`Node "${id}" not found`)

      if (isEnrolled) {
         node.data.status = changeModuleStatus(node.data.status)
         node.data.canEnroll = true
         nodes = nodes.map(n => n.id === node.id ? node : n)
         updateNodeData(node.id, { ...node.data })
      }

      verifyTargetEnrollment(id, nodes)
   }

   function handleClick() {
      if (clickTimeoutRef.current) {
         clearTimeout(clickTimeoutRef.current)
         clickTimeoutRef.current = null
      }

      clickTimeoutRef.current = setTimeout(() => {
         propagateSelection(id)
         clickTimeoutRef.current = null
      }, 300)
   }

   function handleDoubleClick() {
      if (clickTimeoutRef.current) {
         clearTimeout(clickTimeoutRef.current)
         clickTimeoutRef.current = null
      }

      updateNodeStatus()
   }

   return (
      <button
         onClick={handleClick}
         onDoubleClick={handleDoubleClick}
         className={'cursor-pointer py-2 px-4 rounded-md text-white text-shadow-white-dim z-20' +
            (data.status === 'Pendiente' && !data.canEnroll ? ' bg-node' : '') +
            (data.status === 'Pendiente' && data.canEnroll ? ' bg-node outline-[1.9px] outline-white' : '') +
            (data.status === 'Regular' ? ' bg-taken box-shadow-taken' : '') +
            (data.status === 'Aprobado' ? ' bg-passed box-shadow-passed' : '')
         }
      >
         <Handle
            type='target'
            style={{ opacity: 0 }}
            isConnectable={false}
            position={Position.Top}
         />

         <p className='text-base font-semibold'>{data.name}</p>
         <p className='text-xs'>{data.status}</p>

         <Handle
            type='source'
            style={{ opacity: 0 }}
            isConnectable={false}
            position={Position.Bottom}
         />
      </button>
   )
}
