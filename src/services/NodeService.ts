import type { IModuleNode } from "../components/ModuleNode"
import type { IPeriodNode } from "../components/PeriodNode"

type Node = IModuleNode | IPeriodNode

export default class NodeService {
   public static calculatePositionX(prevNode: Node | null) {
      const NODE_SPACING = 10
      const EXTRA_LABEL_SPACING = 20

      const prevNodePos = (!prevNode) ? 0 : prevNode.position.x + EXTRA_LABEL_SPACING
      const prevNodeWidth = prevNode?.measured?.width ?? 0

      return prevNodePos + prevNodeWidth + NODE_SPACING
   }

   public static calculatePositionY(node: Node) {
      const NODE_VERTICALLY_SPACING = 150
      return (NODE_VERTICALLY_SPACING * (node.data.year - 1))
   }
}
