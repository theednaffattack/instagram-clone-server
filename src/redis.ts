import Redis from "ioredis";
import { RedisPubSub } from "graphql-redis-subscriptions";

const nodeEnvIs_NOT_Prod = process.env.NODE_ENV !== "production";

const homeOptions: Redis.RedisOptions = {
  host: "localhost",
  port: 6379,
  retryStrategy: (times: any) => Math.max(times * 100, 3000)
};

const prodOptions: Redis.RedisOptions = {
  host: "pearlfish.redistogo.com",
  port: 9963,
  name: "redistogo",
  password: "ddaf1c87a85195830ed43c6150b15a71",
  retryStrategy: (times: any) => Math.max(times * 100, 3000)
};

// create Redis-based pub-sub
export const pubSub = nodeEnvIs_NOT_Prod
  ? new RedisPubSub({
      publisher: new Redis(homeOptions),
      subscriber: new Redis(homeOptions)
    })
  : new RedisPubSub({
      publisher: new Redis(prodOptions),
      subscriber: new Redis(prodOptions)
    });

export const redis = nodeEnvIs_NOT_Prod
  ? new Redis(homeOptions)
  : new Redis(prodOptions);
