import { type NodeProps, type Node, Position, Handle, useReactFlow } from "@xyflow/react"
import type { Module, NodeData } from "../types/types"
import changeModuleStatus from "../utils/changeModuleStatus"
import checkEnrollment from "../utils/checkEnrollment"
import useNodes from "../store/useNodes"
import { useEffect, useState } from "react"

type ModuleNodeData = {
   [key in keyof Module]: Module[key]
} & {
   [key in keyof NodeData]: NodeData[key]
} & {
   canEnroll: boolean
}

export type IModuleNode = Node<ModuleNodeData, 'module'>

export default function ModuleNode({ id, data }: NodeProps<IModuleNode>) {
   const [state, setState] = useState({
      status: data.status,
      canEnroll: data.canEnroll
   })
   const { updateNodeData, getNodeConnections } = useReactFlow()
   const { moduleNodes } = useNodes((state) => state)

   useEffect(() => {
      setState({
         status: data.status,
         canEnroll: data.canEnroll
      })
   }, [data.status, data.canEnroll])

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

   function handleClick() {
      let nodes = moduleNodes
      const node = moduleNodes.find(n => n.id === id)

      const isEnrolled = checkEnrollment(id, nodes)

      if (!node) throw new Error(`Node "${id}" not found`)

      if (isEnrolled) {
         node.data.status = changeModuleStatus(node.data.status)
         node.data.canEnroll = true
         nodes = nodes.map(n => n.id === node.id ? node : n)
         updateNodeData(node.id, { data: node.data })
      }

      verifyTargetEnrollment(id, nodes)
   }

   return (
      <button onClick={handleClick} className={
         'cursor-pointer py-2 px-4 rounded-md text-white text-shadow-white-dim z-20' +
         `${(state.status === 'Pendiente' && !state.canEnroll) ? ' bg-node' : ''}` +
         `${(state.status === 'Pendiente' && state.canEnroll) ? ' bg-node border border-white' : ''}` +
         `${state.status === 'Regular' ? ' bg-taken shadow-taken' : ''}` +
         `${state.status === 'Aprobado' ? ' bg-passed shadow-passed' : ''}`
      }>
         <Handle
            type='target'
            style={{ opacity: 0 }}
            isConnectable={false}
            position={Position.Top}
         />

         <p className='text-base font-semibold'>{data.name}</p>
         <p className='text-xs'>{state.status}</p>

         <Handle
            type='source'
            style={{ opacity: 0 }}
            isConnectable={false}
            position={Position.Bottom}
         />
      </button>
   )
}
