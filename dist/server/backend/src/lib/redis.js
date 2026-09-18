import { Redis } from 'ioredis';
import { env } from '../config/env.js';
export const redis = new Redis(env.REDIS_URL || 'redis://localhost:6379', {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null, // não trava o servidor tentando reconectar em loop infinito
    enableOfflineQueue: false,
});
redis.on('error', () => {
    // Graceful degradation when redis is offline in dev/test
});
export class CacheService {
    static memoryStore = new Map();
    static async get(key) {
        try {
            if (redis.status === 'ready') {
                return await redis.get(key);
            }
        }
        catch {
            // fallback to memory
        }
        const item = this.memoryStore.get(key);
        if (!item)
            return null;
        if (Date.now() > item.expiresAt) {
            this.memoryStore.delete(key);
            return null;
        }
        return item.value;
    }
    static async set(key, value, ttlSeconds = 60) {
        try {
            if (redis.status === 'ready') {
                await redis.set(key, value, 'EX', ttlSeconds);
                return;
            }
        }
        catch {
            // fallback to memory
        }
        this.memoryStore.set(key, {
            value,
            expiresAt: Date.now() + ttlSeconds * 1000,
        });
    }
    static async del(key) {
        try {
            if (redis.status === 'ready') {
                await redis.del(key);
                return;
            }
        }
        catch {
            // fallback to memory
        }
        this.memoryStore.delete(key);
    }
}
//# sourceMappingURL=redis.js.map