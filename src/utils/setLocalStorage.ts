import type { Store } from "../types/types"

export default function setLocalStorage(store: Store) {
   localStorage.setItem('store', JSON.stringify(store))
}
