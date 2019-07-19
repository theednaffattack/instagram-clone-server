import Redis from "ioredis";

// export const redis = new Redis();
export const redis = new Redis(process.env.REDISTOGO_URL);
