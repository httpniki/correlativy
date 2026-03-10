import type { IPeriodNode } from "../components/PeriodNode"
import type { IModuleNode } from "../components/ModuleNode"

export default function getNodesByType<T extends IModuleNode | IPeriodNode>(nodes: (IModuleNode | IPeriodNode)[], type: 'module' | 'period'): T[]{
   return nodes.filter(n => n.type === type).sort((a, b) => a.data.year - b.data.year) as T[]
}
