import type { Node, NodeProps } from "@xyflow/react"
import type { NodeData } from "../types/types"

export type PeriodNodeData = {
   [key in keyof NodeData]: NodeData[key]
}

export type IPeriodNode = Node<PeriodNodeData, 'period'>

export default function PeriodNode({ data }: NodeProps<IPeriodNode>) {
   return (
      <div className='border-r py-4 pr-4 border-white text-shadow-white-dim'>
         <p className='text-white text-end'>{data.year}°</p>
         <p className='text-white pr-1'>Año {data.year}</p>
      </div>
   )
}
