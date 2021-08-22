/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-22
 * Description:
 *   Route to delete a transaction and update the points count
 *   accordingly.
 */

import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { param } from "express-validator";
import { requireAuth, validateRequest } from "../../middlewares";
import { ResBody } from "../../types";
import { Property, Transaction } from "../../models";
import { NotFoundError } from "../../errors";

const router = Router();

router.delete(
  "/:transactionId",
  requireAuth,
  [param("transactionId").notEmpty().isMongoId()],
  validateRequest,
  async (req: Request, res: Response<ResBody>) => {
    const { transactionId } = req.params;
    const user = req.user!;

    // Find documents needed for this route
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId: user.id,
    });
    if (!transaction || transaction.isDeleted) {
      throw new NotFoundError(
        `Transaction "${transactionId}" could not be found.`
      );
    }
    const property = await Property.findOne({ userId: user.id });
    if (!property) {
      throw new NotFoundError(
        "Could not locate property data for the current user."
      );
    }

    // These values will be populated and returned
    let deletedTransaction = {};
    let newPoints = 0;

    /*
     * We should perform the following in this function:
     * - (1) Set the target transaction as deleted.
     * - (2) Update the number of points that the user has in the Users
     *   document after the transaction is reverted.
     * These operations should be atomic.
     */
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // === Soft delete transaction
      transaction.isDeleted = true;
      deletedTransaction = await transaction.save();
      // === END Soft delete transaction

      // === Update user points
      property.points -= transaction.pointsChange;
      const savedProperty = await property.save();
      newPoints = savedProperty.points;
      // === END Update user points
    });
    session.endSession();

    return res.json({
      success: true,
      payload: {
        transaction: deletedTransaction,
        points: newPoints,
      },
    });
  }
);

export { router as deleteTransactionRouter };
