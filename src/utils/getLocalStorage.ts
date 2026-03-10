import type { Store } from "../types/types"

export default function getLocalStorage(): Store | null {
   const storage = localStorage.getItem('store')
   return storage ? JSON.parse(storage) as Store : null
}
