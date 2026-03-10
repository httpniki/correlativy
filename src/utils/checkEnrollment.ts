import type { Node } from "@xyflow/react"
import type { IModuleNode } from "../components/ModuleNode"

export default function checkEnrollment(node_id: Node['id'], nodes: IModuleNode[]) {
   const node = nodes.find(n => n.id === node_id)

   if (!node) throw new Error('Node not found')
   const { requirements } = node.data

   const requiredTaken = nodes.filter(e => requirements.taken.includes(e.id)) 
   const requiredPassed = nodes.filter(e => requirements.passed.includes(e.id))

   const isAllTaken = requiredTaken.every(n => n.data.status === 'Regular' || n.data.status === 'Aprobado')
   const isAllPassed = requiredPassed.every(n => n.data.status === 'Aprobado')

   return isAllTaken && isAllPassed
}
