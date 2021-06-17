import { configApp } from "./config-app";
import { startServer } from "./server";

// Try to catch any uncaught async errors.
process.on("uncaughtException", (err) => {
  console.error("There was an uncaught error", err);
  process.exit(1); //mandatory (as per the Node.js docs)
});

async function main() {
  let config;

  // Prepare app by loading all config options.
  try {
    config = await configApp();
  } catch (error) {
    console.error(error);
    throw Error(error);
  }

  if (!config) {
    throw Error("No config object sensed, please check env vars.");
  }
  // Start the application server.
  try {
    await startServer(config);
  } catch (error) {
    console.error(error);
    throw Error(error);
  }
}

main().catch((mainErr) =>
  console.error("ERROR EXECUTING MAIN FUNCTION", mainErr)
);
