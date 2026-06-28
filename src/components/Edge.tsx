import { BaseEdge, getBezierPath, type Edge as EdgeType, type EdgeProps, Position, type Edge } from "@xyflow/react"

export type IEdge = EdgeType<EdgeType>

export default function Edge(props: EdgeProps<IEdge>) {
   const [edgePath] = getBezierPath({
      sourceX: props.sourceX,
      sourceY: props.sourceY,
      sourcePosition: Position.Bottom,
      targetX: props.targetX,
      targetY: props.targetY,
   })

   return (
      <BaseEdge
         id={props.id}
         path={edgePath}
         style={{ stroke: '#555' }}
      />
   )
} 
