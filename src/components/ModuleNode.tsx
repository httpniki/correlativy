import { type NodeProps, type Node, Position, Handle } from "@xyflow/react"
import type { Module, NodeData } from "../types/types"
import { useRef } from "react"

type ModuleNodeData = {
   [key in keyof Module]: Module[key]
} & {
   [key in keyof NodeData]: NodeData[key]
} & {
   canEnroll: boolean
   onNodeClick: (id: string) => void
   onNodeDoubleClick: (id: string) => void
}

export type IModuleNode = Node<ModuleNodeData, 'module'>

export default function ModuleNode({ id, data }: NodeProps<IModuleNode>) {
   const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

   function handleClick() {
      if (clickTimeoutRef.current) {
         clearTimeout(clickTimeoutRef.current)
         clickTimeoutRef.current = null
      }

      clickTimeoutRef.current = setTimeout(() => {
         data.onNodeClick(id)
         clickTimeoutRef.current = null
      }, 200)
   }

   function handleDoubleClick() {
      if (clickTimeoutRef.current) {
         clearTimeout(clickTimeoutRef.current)
         clickTimeoutRef.current = null
      }

      data.onNodeDoubleClick(id)
   }

   function handleContextMenu(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
      e.preventDefault()
   }

   return (
      <button
         onClick={handleClick}
         onContextMenu={handleContextMenu}
         onDoubleClick={handleDoubleClick}
         className={'cursor-pointer py-2 px-4 rounded-md z-20 text-white' +
            (data.status === 'Pendiente' && !data.canEnroll ? ' bg-node text-white' : '') +
            (data.status === 'Pendiente' && data.canEnroll ? ' bg-node outline outline-white' : '') +
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

         <p className='text-base'>{data.id}</p>
         <p className='text-lg font-semibold'>{data.name}</p>
         <p className='text-base'>{data.status}</p>

         <Handle
            type='source'
            style={{ opacity: 0 }}
            isConnectable={false}
            position={Position.Bottom}
         />
      </button>
   )
}
