/*
 * @Author: lyu
 * @Date: 2022-08-10 11:11:24
 */
import type { PiniaPluginContext, StateTree } from 'pinia';

declare module 'pinia' {
  // eslint-disable-next-line no-unused-vars
  export interface DefineStoreOptionsBase<S extends StateTree, Store> {
    persist?: PersistProps<keyof S>[] | boolean;
  }
}
interface StorageProps {
  storage?: Storage;
}
type CryptProps =
  | {
      useCrypt?: false;
      encrypt?: never;
      decrypt?: never;
    }
  | {
      useCrypt: true;
      encrypt: (data: string) => string;
      decrypt: (secretData: string) => string;
    };
export type PersistProps<T = any> = {
  name?: string;
  keys?: T[];
} & StorageProps & CryptProps;

const STORAGE = window.sessionStorage;

const defaultProps: StorageProps & CryptProps = {
  storage: STORAGE,
  useCrypt: false
};

type PiniaStore = PiniaPluginContext['store'];

const isString = (data: any) => Object.prototype.toString.call(data) === '[object String]';
const isFunc = (data: any) => Object.prototype.toString.call(data) === '[object Function]';
const getState = (key: string, strategy: PersistProps) => {
  const storage = strategy.storage || defaultProps.storage || STORAGE;
  const decrypt = strategy.decrypt || defaultProps.decrypt;
  const useCrypt = strategy.useCrypt || defaultProps.useCrypt;
  let value = storage.getItem(key);

  if (useCrypt && value && decrypt && isFunc(decrypt)) {
    value = decrypt(value);
  }
  try {
    if (isString(value)) {
      return JSON.parse(value!);
    }
    return undefined;
  } catch (err) {
    throw err;
  }
};

/**
 * 进行持久化处理
 */
const setState = (strategy: PersistProps, states: StateTree, store: PiniaStore) => {
  const keys = strategy.keys || [];
  const storageKey = strategy.name || store.$id;
  const storage = strategy.storage || defaultProps.storage || STORAGE;
  const encrypt = strategy.encrypt || defaultProps.encrypt;
  const useCrypt = strategy.useCrypt || defaultProps.useCrypt;
  let storeData: any = states;

  if (keys.length) {
    const data = keys.reduce((obj, key) => {
      obj[key] = states[key];
      return obj;
    }, {} as Record<string, any>);
    storeData = data;
  }

  storeData = JSON.stringify(storeData);

  if (useCrypt && encrypt && isFunc(encrypt)) {
    storeData = encrypt(storeData);
  }

  storage.setItem(storageKey, storeData);
};

export const createPersist = ({ options, store }: PiniaPluginContext): void => {
  let { persist } = options;

  if (!persist) return;
  if (!Array.isArray(persist)) {
    persist = [
      {
        name: store.$id
      }
    ];
  }

  const strategies = persist;

  strategies.forEach(strategy => {
    const data = getState(strategy.name || store.$id, strategy);

    if (data) {
      store.$state = Object.assign(store.$state, data);
    }
  });
  store.$subscribe((_: any, states: StateTree) => {
    strategies.forEach(strategy => {
      setState(strategy, states, store);
    });
  });
};

export const persist = (options?: StorageProps & CryptProps): ((options: PiniaPluginContext) => void) => {
  Object.assign(defaultProps, options);
  return createPersist;
};
