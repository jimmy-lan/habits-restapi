/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-21
 * Description:
 *   Route to create a transaction and update points count for the current
 *   user.
 */

import { Request, Response, Router } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import { ResBody } from "../../types";
import { requireAuth, validateRequest } from "../../middlewares";
import { Property, Transaction } from "../../models";
import { NotFoundError } from "../../errors";

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

    // These values will be populated and returned
    let createdTransaction = {};
    let newPoints = 0;

    /*
     * We should perform the following in this function:
     * - (1) Create a new transaction for the current user, recording
     *   the title of this transaction, if given, and points change.
     * - (2) Update the number of points that the user has.
     * These operations should be atomic. For example, if (2) fails, we
     * should revert operation (1).
     */
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // === Add user points
      const property = await Property.findOne({ userId: id }, null, {
        session,
      });
      if (!property) {
        throw new NotFoundError(
          "Could not locate property data for the current user."
        );
      }

      property.points += pointsChange;
      property.numTransactions++;
      const savedProperty = await property.save();
      newPoints = savedProperty.points;
      // === END Add user points

      // === Add transaction
      createdTransaction = (
        await Transaction.create(
          [
            {
              userId: id,
              title: title || "Untitled transaction",
              pointsChange,
            },
          ],
          { session }
        )
      )[0];
      // === END Add transaction
    });
    session.endSession();

    return res.status(201).json({
      success: true,
      payload: {
        transaction: createdTransaction,
        points: newPoints,
      },
    });
  }
);

export { router as createTransactionRouter };
