import chalk from "chalk";
import { AppServerConfigProps } from "./types/Config";

export function serverOnListen(config: AppServerConfigProps) {
  return console.log(
    `
    
    🚀 Server ready at\t\t\t${chalk.green(config.host)}
    🚀 GraphQL Playground ready at\t${chalk.green(
      config.host + config.graphqlEndpoint
    )}

    `
  );
}
