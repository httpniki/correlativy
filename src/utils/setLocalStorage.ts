import type { Program } from "../types/types"

export default function setLocalStorage(store: Program) {
   localStorage.setItem('store', JSON.stringify(store))
}
