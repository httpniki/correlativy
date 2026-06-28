import type { AcademicModule } from "../domain/AcademicModule"
import useNodeActions from "../hooks/useNodeActions"
import useNodes from "../store/useNodes"

export interface IMenu {
   id: string
   top: number
   left: number
   node_id: string
}

interface Requeriments {
   passed: AcademicModule[]
   taken: AcademicModule[]
}

export default function ContextMenu(props: IMenu) {
   const program = useNodes((state) => state.getProgram())
   const node = program?.periods.find(p => p.modules.some(m => m.id === props.node_id))?.modules.find(m => m.id === props.node_id)
   const requeriments: Requeriments = { passed: [], taken: [] }
   const nodeAction = useNodeActions()

   node?.requirements.passed.forEach((id) => {
      if (!program) return

      const mod = program
         .periods
         .find(p => p.modules.some(m => m.id === id))
         ?.modules.find(m => m.id === id)

      if (mod) return requeriments.passed.push(mod)
   })

   node?.requirements.taken.forEach((id) => {
      if (!program) return

      const mod = program
         .periods
         .find(p => p.modules.some(m => m.id === id))
         ?.modules.find(m => m.id === id)

      if (mod) return requeriments.taken.push(mod)
   })

   const hasRequirements = (requeriments.passed.length > 0 || requeriments.taken.length > 0)
   const hasTakenRequeriments = (requeriments.taken.length > 0)
   const hasPassedRequeriments = (requeriments.passed.length > 0)

   function onChangeStatus() {
      if (!node || !node.canEnroll) return
      nodeAction.switchNodeStatus(node.id)
   }

   return (
      <div
         style={{ top: props.top, left: props.left }}
         className='w-80 text-white absolute text-sm bg-node bg-opacity-50 p-2 z-1000 shadow-[0_0_10px_#ffffff10] rounded-sm'
      >
         <div className='flex flex-col items-center border p-2 border-white'>
            <header className='w-full flex flex-col gap-1 items-center'>
               <p>{node?.id}</p>
               <p>{node?.name}</p>

               <p
                  className={
                     'flex justify-between gap-2' +
                     (node?.status === 'Pendiente' ? ' text-white' : '') +
                     (node?.status === 'Regular' ? ' text-taken' : '') +
                     (node?.status === 'Aprobado' ? ' text-passed' : '')
                  }
               >
                  {node?.status}
               </p>
            </header>

            {(hasRequirements) &&
               <div className='border-t border-white/10 pt-2 mt-2 w-full'>
                  <h4 className='font-bold text-center'>Requerimientos:</h4>

                  <div>
                     {(hasTakenRequeriments) && <RequirementList title='Cursado' items={requeriments.taken} />}
                     {(hasPassedRequeriments) && <RequirementList title='Aprobado' items={requeriments.passed} />}
                  </div>
               </div>
            }

            {(node?.status === 'Pendiente') &&
               <p className='border-t border-white/10 pt-2 mt-2'>
                  {
                     (node?.canEnroll)
                        ? 'Cumples la correlatividad para cursar esta asignatura.'
                        : 'No cumples la correlatividad para cursar esta asignatura.'
                  }
               </p>
            }

            <button
               disabled={!node?.canEnroll}
               onClick={onChangeStatus}
               className='w-full border p-2 bg-node mt-2 text-center text-sm disabled:opacity-20 cursor-pointer disabled:cursor-default hover:opacity-75 disabled:hover:opacity-20'
            >
               {node?.status === 'Pendiente' ? 'Regularizar' : ''}
               {node?.status === 'Regular' ? 'Promover' : ''}
               {node?.status === 'Aprobado' ? 'Reiniciar' : ''}
            </button>
         </div>
      </div>
   )
}

interface RequerimentListProps {
   title: string
   items: AcademicModule[]
}

function RequirementList({ title, items }: RequerimentListProps) {
   return (
      <div className='w-full'>
         <p className='pt-2 pb-1 font-bold'>{title}</p>

         <ul className='flex flex-col gap-2'>
            {items.map(m => (
               <li
                  className={(m.status === 'Aprobado' ? 'text-green-500' : 'text-red-500')}
                  key={m.id}
               >
                  {m.id} - {m.name}
               </li>
            ))}
         </ul>
      </div>
   )
}
