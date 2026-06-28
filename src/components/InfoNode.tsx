import type { Node, NodeProps } from "@xyflow/react"

type InfoNodeData = {
   programName: string
   programPlan: number
}

export type IInfoNode = Node<InfoNodeData, 'info'>

export default function InfoNode({ data }: NodeProps<IInfoNode>) {
   return (
      <header>
         <div className='flex flex-2 flex-col justify-center items-center gap-2 text-white py-10'>
            <h1 className='text-4xl text-center px-1 text-white text-shadow-white whitespace-nowrap'>{data.programName}</h1>

            <p className='text-white text-2xl text-shadow-white whitespace-nowrap'>Plan {data.programPlan} - Equivalencias</p>

            <div className='flex gap-3 text-white text-shadow-white px-1'>
               <p className='flex gap-2 items-center text-2xl'>
                  <span className='bg-node px-1 border w-4 h-4' />
                  Pendiente
               </p>

               <p>·</p>

               <p className='flex gap-2 items-center text-2xl'>
                  <span className='bg-taken border w-4 h-4' />
                  Regular
               </p>

               <p>·</p>

               <p className='flex gap-2 items-center text-2xl'>
                  <span className='bg-passed border w-4 h-4' />
                  Aprobado
               </p>
            </div>
         </div>
      </ header>
   )
}
