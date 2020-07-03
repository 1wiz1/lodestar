import {ByteVector, toHexString, TreeBacked} from "@chainsafe/ssz";
import {BeaconState} from "@chainsafe/lodestar-types";
import {EpochContext} from "@chainsafe/lodestar-beacon-state-transition";

export interface IStateContextCacheItem {
  state: TreeBacked<BeaconState>;
  epochCtx: EpochContext;
}

/**
 * In memory cache of BeaconState and connected EpochContext
 *
 * Similar API to Repository
 */
export class StateContextCache {
  private cache: Record<string, IStateContextCacheItem>;
  constructor() {
    this.cache = {};
  }

  public async get(root: ByteVector): Promise<IStateContextCacheItem | null> {
    const item = this.cache[toHexString(root)];
    if (!item) {
      return null;
    }
    return this.clone(item);
  }

  public async add(item: IStateContextCacheItem): Promise<void> {
    this.cache[toHexString(item.state.hashTreeRoot())] = this.clone(item);
  }

  public async delete(root: ByteVector): Promise<void> {
    delete this.cache[toHexString(root)];
  }

  public async batchDelete(roots: ByteVector[]): Promise<void> {
    await Promise.all(roots.map((root) => this.delete(root)));
  }

  public clear(): void {
    this.cache = {};
  }

  public async values(): Promise<IStateContextCacheItem[]> {
    return Object.values(this.cache).map(item => this.clone(item));
  }

  private clone(item: IStateContextCacheItem): IStateContextCacheItem {
    return {
      state: item.state.clone(),
      epochCtx: item.epochCtx.copy()
    };
  }
}
