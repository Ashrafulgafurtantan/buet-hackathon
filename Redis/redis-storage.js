import { createClient } from 'redis';

const client = createClient();

class RedisStorage {
    client = null;

    constructor() {
        console.log('[Redis Storage] created');
        this.client = this.redisClient();
        this.client.multi();
    }

    redisClient() {
        client.connect();
        client['localError']=false;
        client.on('connect', function () {
            client['localError']=false;
            console.log('[Redis Client] Connected!');
        });
        client.on('error', function (e) {
            client['localError']=true;
            console.log('[Redis Client] '+ e);
        });
        return client
    }

    async getItem(key) {
        if (this.client['localError'] === true) return null;
        let value = JSON.parse(await this.client.get(key));
        return value ? value : null;
    }

    async setItem(key, val, ttl) {
        if (this.client['localError'] !== true) {
            await this.client.set(key, JSON.stringify(val), {
                EX: ttl,
            });
        }
    }

}