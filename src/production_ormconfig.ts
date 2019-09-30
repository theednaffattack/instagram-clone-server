import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

const isLoggingTrue = process.env.TYPEORM_LOGGING === "true";
const isSynchronizeTrue = process.env.TYPEORM_SYNCHRONIZE === "true";

export const productionOrmConfig: PostgresConnectionOptions = {
  name: "staging",
  type: "postgres",
  host: process.env.TYPEORM_HOST!,
  port: parseInt(process.env.TYPEORM_PORT!),
  ssl: true,
  username: process.env.TYPEORM_USERNAME!,
  password: process.env.TYPEORM_PASSWORD!,
  database: process.env.TYPEORM_DATABASE!,
  logging: isLoggingTrue,
  synchronize: isSynchronizeTrue,
  entities: ["dist/entity/*.*"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"]
};
