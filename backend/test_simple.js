
try {
  console.log("Starting test...");
  const express = require('express');
  console.log("Express loaded.");
  const errorMiddleware = require('./middleware/error');
  console.log("Middleware loaded.");
  const app = express();
  app.use(errorMiddleware);
  console.log("App use middleware success.");
} catch (error) {
  console.error("Crash:", error);
}
