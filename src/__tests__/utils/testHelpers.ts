export function createMockLocalStorage() {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    _getStore: () => store,
    _setStore: (newStore: Record<string, string>) => {
      store = { ...newStore };
    },
  };
}

export function setupLocalStorageMock() {
  const store: Record<string, string> = {};
  
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach(key => delete store[key]);
      },
      _store: store,
    },
    writable: true,
    configurable: true,
  });
  
  return {
    getStore: () => store,
    clearStore: () => Object.keys(store).forEach(key => delete store[key]),
  };
}

export function getLocalStorageStore(): Record<string, string> {
  return (globalThis.localStorage as Record<string, string> & { _store?: Record<string, string> })._store || {};
}