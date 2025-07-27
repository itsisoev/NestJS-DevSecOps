declare module 'cache-manager-ioredis' {
  import { Store } from 'cache-manager';
  import { RedisOptions } from 'ioredis';

  interface RedisStoreOptions extends RedisOptions {
    ttl?: number;
  }

  export function create(options?: RedisStoreOptions): Store;
}
