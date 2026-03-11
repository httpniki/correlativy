import { BaseEdge, getBezierPath, type Edge as EdgeType, type EdgeProps, Position, useReactFlow } from "@xyflow/react"
import useNodes from "../store/useNodes"
import { useEffect } from "react"

export default function Edge(props: EdgeProps<EdgeType>) {
   const { moduleNodes, edges } = useNodes((state) => state)
   const { updateNode, updateEdge } = useReactFlow()

   const [edgePath] = getBezierPath({
      sourceX: props.sourceX,
      sourceY: props.sourceY,
      sourcePosition: Position.Bottom,
      targetX: props.targetX,
      targetY: props.targetY,
   })

   useEffect(() => {
      if (!props.selected) return

      moduleNodes.forEach(node => {
         if (node.id === props.source) return updateNode(node.id, { style: { opacity: 1 } })
         if (node.id === props.target) return updateNode(node.id, { style: { opacity: 1 } })

         updateNode(node.id, { style: { opacity: 0.5 } })
      })

      edges.forEach(edge => {
         if (edge.id === props.id) return updateEdge(edge.id, { hidden: false })
         updateEdge(edge.id, { hidden: true })
      })
   }, [props.selected])

   return (
      <BaseEdge
         id={props.id}
         path={edgePath}
      />
   )
} 
