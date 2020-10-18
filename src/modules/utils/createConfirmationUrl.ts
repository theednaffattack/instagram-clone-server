import { DEVELOPMENT_HOST } from "../../constants";
// import { v4 } from "uuid";
import { redis } from "../../redis";
import { confirmUserPrefix } from "../constants/redisPrefixes";

export const createConfirmationUrl = async (userId: string) => {
  // const token = v4();
  await redis.set(confirmUserPrefix + userId, userId, "ex", 60 * 60 * 24); // 1 day expiration

  return `http://${DEVELOPMENT_HOST}/confirmation/${userId}`;
};
