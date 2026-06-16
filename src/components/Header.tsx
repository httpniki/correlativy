interface Props {
   programName: string
   programPlan: number
   hidden: boolean
   onResetPositions: () => void
   onFitView: () => void
}

export default function Header({ programName, programPlan, hidden, onResetPositions, onFitView }: Props) {
   return (
      <header className={`w-full grid grid-cols-3 grid-rows-1 ${hidden ? 'invisible' : ''}`}>
         <div className='flex col-2 flex-2 flex-col justify-center items-center gap-1 text-white py-10'>
            <h1 className='text-2xl text-center bg-main px-1 text-white text-shadow-white'>{programName}</h1>

            <p className='text-white bg-main text-shadow-white'>Plan {programPlan} - Equivalencias</p>

            <div className='flex gap-3 text-white text-shadow-white bg-main px-1'>
               <p className='flex gap-1 items-center'>
                  <span className='bg-node px-1 border w-4 h-4' />
                  Pendiente
               </p>

               <p>·</p>

               <p className='flex gap-1 items-center'>
                  <span className='bg-taken border w-4 h-4' />
                  Regular
               </p>

               <p>·</p>

               <p className='flex gap-1 items-center'>
                  <span className='bg-passed border w-4 h-4' />
                  Aprobado
               </p>
            </div>
         </div>

         <div className='col-3 flex flex-col gap-2 items-end justify-start px-4 text-white'>
            <button
               className='cursor-pointer pointer-events-auto bg-main px-1 hover:opacity-80'
               onClick={onResetPositions}
            >
               Reiniciar posiciones
            </button>

            <button
               className='cursor-pointer pointer-events-auto bg-main px-1 hover:opacity-80'
               onClick={onFitView}
            >
               Ajustar vista
            </button>
         </div>
      </header>
   )
}
