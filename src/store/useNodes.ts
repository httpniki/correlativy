import { create } from "zustand"
import type { IModuleNode } from "../components/ModuleNode"
import type { IPeriodNode } from "../components/PeriodNode"
import type { Program } from "../types/types"
import type { Edge } from "@xyflow/react"

interface Store {
   moduleNodes: IModuleNode[]
   periodNodes: IPeriodNode[]
   edges: Edge[]
   program: Program | null
   setProgram: (program: Program) => void
   setNodes: (nodes: (IModuleNode | IPeriodNode)[]) => void
   setEdges: (edges: Edge[]) => void
   getAllNodes: () => (IModuleNode | IPeriodNode)[]
}

const useNodes = create<Store>((set, get) => ({
   moduleNodes: [],
   periodNodes: [],
   edges: [],
   program: null,
   setNodes: (nodes: (IModuleNode | IPeriodNode)[]) => set(() => {
      const moduleNodes = nodes.filter(n => n.type === 'module').sort((a, b) => a.data.year - b.data.year)
      const periodNodes = nodes.filter(n => n.type === 'period').sort((a, b) => a.data.year - b.data.year)

      return { moduleNodes, periodNodes }
   }),
   setEdges: (edges: Edge[]) => set({ edges }),
   setProgram: (program: Program) => set({ program }),
   getAllNodes: () => {
      const { moduleNodes, periodNodes } = get()
      return [...moduleNodes, ...periodNodes]
   }
}))

export default useNodes
