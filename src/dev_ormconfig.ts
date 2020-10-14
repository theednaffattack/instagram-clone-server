import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export const devOrmconfig: PostgresConnectionOptions = {
  name: "default",
  type: "postgres",
  host: "localhost",
  port: 5432,
  ssl: false,
  username: "eddienaff",
  password: "eddienaff",
  database: "instagram_clone",
  logging: false,
  synchronize: true,
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
  cli: {
    entitiesDir: "dist/entity",
    migrationsDir: "src/migration",
    subscribersDir: "src/subscriber",
  },
};
