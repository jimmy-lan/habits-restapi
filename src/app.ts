/*
 * Created by Jimmy Lan
 * Creation Date: 2021-03-03
 */

import express from "express";
import morgan from "morgan";
import "express-async-errors";

// Router Imports
import { authRouter, invitationsRouter, transactionsRouter } from "./routes";
import { handleErrors, rateLimitIp, requireAuth } from "./middlewares";
import { NotFoundError } from "./errors";
import { propertiesRouter } from "./routes/properties";

const app = express();

// App settings
app.set("port", process.env.PORT || 3000);
app.set("env", process.env.NODE_ENV || app.get("env"));
app.enable("trust proxy");

// Middlewares
app.use(express.json());
app.use(
  morgan("tiny", {
    skip() {
      return process.env.NODE_ENV === "test";
    },
    stream: {
      write(str: string) {
        console.log(str.trim());
      },
    },
  })
);
app.use(rateLimitIp);

// Register routers
app.use("/api/v1/users", authRouter);
app.use("/api/v1/transactions", requireAuth, transactionsRouter);
app.use("/api/v1/properties", requireAuth, propertiesRouter);
app.use("/api/v1/invitations", invitationsRouter);

// Resource not found
app.all("*", () => {
  throw new NotFoundError();
});

// Error fallback
app.use(handleErrors);

export { app };
