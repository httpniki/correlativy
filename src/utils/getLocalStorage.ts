import type { Program } from "../types/types"

export default function getLocalStorage(): Program | null {
   const storage = localStorage.getItem('store')
   return storage ? JSON.parse(storage) as Program : null
}
