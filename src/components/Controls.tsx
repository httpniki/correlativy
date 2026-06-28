import AdjustPosition from "./assets/AdjustPosition"
import FitView from "./assets/FitView"

interface Props {
   onResetPositions: () => void
   onAjustView: () => void
}

export default function Controls({ onResetPositions, onAjustView }: Props) {
   return (
      <nav className='absolute top-0 right-0 flex flex-col gap-1 items-end justify-start px-4 text-white'>
         <button
            className='cursor-pointer pointer-events-auto p-1 text-xl hover:opacity-80'
            aria-label='Ajustar a la vista'
            onClick={onAjustView}
         >
            <FitView />
         </button>

         <button
            className='cursor-pointer pointer-events-auto text-2xl p-1 hover:opacity-80'
            aria-label='Reiniciar posiciones'
            onClick={onResetPositions}
         >
            <AdjustPosition />
         </button>
      </nav>
   )
}
