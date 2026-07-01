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
   const btnRef = useRef<HTMLButtonElement>(null)

   function handleClick() {
      if (clickTimeoutRef.current) {
         clearTimeout(clickTimeoutRef.current)
         clickTimeoutRef.current = null
      }

      clickTimeoutRef.current = setTimeout(() => {
         data.onNodeClick(id)
         clickTimeoutRef.current = null
      }, 210)
   }

   function handleDoubleClick() {
      if (btnRef.current) {
         btnRef.current?.classList.remove('animation-error')

         if (!data.canEnroll) {
            void btnRef.current?.offsetWidth
            btnRef.current?.classList.add('animation-error')
         }
      }

      if (clickTimeoutRef.current) {
         clearTimeout(clickTimeoutRef.current)
         clickTimeoutRef.current = null
      }

      data.onNodeDoubleClick(id)
   }

   return (
      <button
         onClick={handleClick}
         ref={btnRef}
         onContextMenu={event => event.preventDefault()}
         onDoubleClick={handleDoubleClick}
         className={'active:animate-scale-in transition-colors cursor-pointer py-2 px-4 rounded-md z-20 text-white' +
            (data.status === 'Pendiente' && !data.canEnroll ? ' bg-node text-white hover:bg-node-hover' : '') +
            (data.status === 'Pendiente' && data.canEnroll ? ' bg-node outline outline-white hover:bg-node-hover' : '') +
            (data.status === 'Regular' ? ' bg-taken hover:bg-taken-hover' : '') +
            (data.status === 'Aprobado' ? ' bg-passed hover:bg-passed-hover' : '')
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
