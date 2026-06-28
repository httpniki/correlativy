import { useReactFlow } from "@xyflow/react"

export default function useLayout(refPanel: React.RefObject<HTMLDivElement | null>) {
   const { fitView } = useReactFlow()

   function fitViewport() {
      const PANEL_HEIGHT = refPanel.current?.getBoundingClientRect().height ?? 0
      fitView({ padding: { top: `${PANEL_HEIGHT}px`, left: '40px', right: '40px', bottom: '40px' } })
   }

   return {
      refPanel,
      fitViewport
   }
}
