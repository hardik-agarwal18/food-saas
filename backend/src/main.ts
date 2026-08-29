import { app } from "./app/app.js";
import { env } from "./config/env.config.js";
import { logger } from "./config/logger.js";

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

const gracefulShutdown = (signal: string) => {
  logger.info(`Shutting down gracefully on ${signal}`);
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error(err.stack);
  process.exit(1); // Exit the process with a failure code
});

process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);

  process.exit(1); // Exit the process with a failure code
});
