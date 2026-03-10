import type { Module } from "../types/types"

export default function changeModuleStatus(currentStatus: Module['status']) {
   switch (currentStatus) {
      case 'Pendiente':
         return 'Regular'
      case 'Regular':
         return 'Aprobado'
      case 'Aprobado':
         return 'Pendiente'
   }
}

