import { useSyncExternalStore } from "react";

export const NARROW = "(max-width: 1099px)";
export const MOBILE = "(max-width: 767px)";

type Store = { subscribe: (cb: () => void) => () => void; get: () => boolean };
const stores = new Map<string, Store>();

function storeFor(query: string): Store {
	let store = stores.get(query);
	if (!store) {
		const mql = window.matchMedia(query);
		store = {
			subscribe: (cb) => {
				mql.addEventListener("change", cb);
				return () => mql.removeEventListener("change", cb);
			},
			get: () => mql.matches,
		};
		stores.set(query, store);
	}
	return store;
}

export function useMediaQuery(query: string): boolean {
	const store = storeFor(query);
	return useSyncExternalStore(store.subscribe, store.get);
}
