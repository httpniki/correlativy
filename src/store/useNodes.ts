import { create } from "zustand"
import type { IModuleNode } from "../components/ModuleNode"
import type { IPeriodNode } from "../components/PeriodNode"
import { applyEdgeChanges, applyNodeChanges, type EdgeChange, type NodeChange } from "@xyflow/react"
import AcademicProgram from "../domain/AcademicProgram"
import type { IEdge } from "../components/Edge"
import type { IInfoNode } from "../components/InfoNode"

interface Store {
   nodes: (IModuleNode | IPeriodNode | IInfoNode)[]
   edges: IEdge[]
   program: AcademicProgram | null
   getProgram: () => (AcademicProgram | null)
   onNodesChange: (changes: NodeChange<IModuleNode | IPeriodNode | IInfoNode>[]) => void;
   onEdgesChange: (changes: EdgeChange<IEdge>[]) => void;
   setProgram: (program: AcademicProgram) => void;
   setNodes: (nodes: (IModuleNode | IPeriodNode | IInfoNode)[]) => void;
   setEdges: (edges: IEdge[]) => void;
}

const useNodes = create<Store>((set, get) => ({
   nodes: [],
   edges: [],
   program: null,
   setProgram: (program: AcademicProgram) => set({ program }),
   setNodes: (nodes: (IModuleNode | IPeriodNode | IInfoNode)[]) => set({ nodes }),
   setEdges: (edges: IEdge[]) => set({ edges }),
   getProgram: () => get().program,
   onNodesChange: (changes: NodeChange<IPeriodNode | IModuleNode | IInfoNode>[]) => set((state) => ({ nodes: applyNodeChanges<IModuleNode | IPeriodNode | IInfoNode>(changes, state.nodes) })),
   onEdgesChange: (changes: EdgeChange<IEdge>[]) => set((state) => ({ edges: applyEdgeChanges<IEdge>(changes, state.edges) }))
}))

export default useNodes
