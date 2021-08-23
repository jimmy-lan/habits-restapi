/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-22
 * Description:
 *   Route to update a transaction and recalculate user points if needed.
 */

import { Router, Request, Response } from "express";
import { requireAuth, validateRequest } from "../../middlewares";
import { param } from "express-validator";
import { ResBody } from "../../types";

const router = Router();

router.patch(
  "/:transactionId",
  requireAuth,
  [param("transactionId").notEmpty().isMongoId()],
  validateRequest,
  async (req: Request, res: Response<ResBody>) => {}
);

export { router as modifyTransactionRouter };
