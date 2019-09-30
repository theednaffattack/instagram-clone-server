import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

const isLoggingFalse = process.env.TYPEORM_LOGGING === "true";
const isSynchronizeTrue = process.env.TYPEORM_SYNCHRONIZE === "true";

const getPortOrSetDefault = process.env.TYPEORM_PORT
  ? parseInt(process.env.TYPEORM_PORT)
  : 5432;

export const productionOrmConfig: PostgresConnectionOptions = {
  name: "staging",
  type: "postgres",
  host: process.env.TYPEORM_HOST,
  port: getPortOrSetDefault,
  ssl: true,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  logging: isLoggingFalse,
  synchronize: isSynchronizeTrue,
  entities: ["dist/entity/*.*"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"]
};
