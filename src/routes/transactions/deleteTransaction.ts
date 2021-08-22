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
import mongoose from "mongoose";
import { Transaction } from "../../models";
import { NotFoundError } from "../../errors";

const router = Router();

router.delete(
  "/:transactionId",
  requireAuth,
  [query("transactionId").notEmpty().isMongoId()],
  validateRequest,
  async (req: Request, res: Response<ResBody>) => {
    const { transactionId } = req.query;
    const user = req.user!;

    const transaction = await Transaction.findOne({
      id: transactionId,
      userId: user.id,
    });
    if (!transaction) {
      throw new NotFoundError(
        `Transaction "${transactionId}" could not be found.`
      );
    }

    /*
     * We should perform the following in this function:
     * - (1) Set the target transaction as deleted.
     * - (2) Update the number of points that the user has in the Users
     *   document after the transaction is reverted.
     * These operations should be atomic. For example, if (2) fails, we
     * should revert operation (1).
     */
    const session = await mongoose.startSession();
    session.withTransaction(async () => {});
    session.endSession();
  }
);
