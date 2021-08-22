/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-22
 * Description:
 *   Route to delete a transaction and update the points count
 *   accordingly.
 */

import { Router, Request, Response } from "express";
import { requireAuth, validateRequest } from "../../middlewares";
import { ResBody } from "../../types";
import { query } from "express-validator";

const router = Router();

router.delete(
  "/:transactionId",
  requireAuth,
  [query("transactionId").notEmpty().isMongoId()],
  validateRequest,
  (req: Request, res: Response<ResBody>) => {}
);
