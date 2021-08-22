/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-21
 * Description:
 *   Route to create a transaction and update points count for the current
 *   user.
 */

import { Request, Response, Router } from "express";
import { ResBody } from "../../types";
import { requireAuth, validateRequest } from "../../middlewares";
import { body } from "express-validator";
import * as mongoose from "mongoose";
import { Transaction } from "../../models/Transaction";

const router = Router();

router.post(
  "/",
  requireAuth,
  [
    body("title").optional().isString().isLength({ min: 2, max: 80 }),
    body("pointsChange").isInt().not().equals("0").not().isString(),
  ],
  validateRequest,
  async (req: Request, res: Response<ResBody>) => {
    const { title, pointsChange } = req.body;
    const { id } = req.user!;

    /*
     * We should perform the following in this function:
     * - (1) Create a new transaction for the current user, recording
     *   the title of this transaction, if given, and points change.
     * - (2) Update the number of points that the user has in the Users
     *   document.
     * These operations should be atomic. For example, if (2) fails, we
     * should revert operation (1).
     */
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // === Add transaction
      const transaction = Transaction.build({
        userId: id,
        title,
        pointsChange,
      });
      await transaction.save();
      // === END Add transaction

      // === Add user points

      // === END Add user points
    });
    session.endSession();

    return res.json({
      success: true,
    });
  }
);

export { router as createTransactionRouter };
