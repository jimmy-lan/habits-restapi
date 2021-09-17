/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-22
 * Description:
 *   Route to delete a transaction and update the points count
 *   accordingly.
 */

import { Request, Response, Router } from "express";
import mongoose from "mongoose";
import { param } from "express-validator";
import { validateRequest } from "../../middlewares";
import { ResBody } from "../../types";
import { Property, Transaction } from "../../models";
import { NotFoundError } from "../../errors";
import { notDeletedCondition } from "../../util";

const router = Router();

router.delete(
  "/:transactionId",
  [param("transactionId").notEmpty().isMongoId()],
  validateRequest,
  async (req: Request, res: Response<ResBody>) => {
    const { transactionId } = req.params;
    const user = req.user!;

    // These values will be populated before return
    let newAmount = 0;

    // Find documents needed for this route
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId: user.id,
      ...notDeletedCondition,
    });
    if (!transaction) {
      throw new NotFoundError(
        `Transaction "${transactionId}" could not be found.`
      );
    }
    const property = await Property.findOne({
      _id: transaction.property,
      userId: user.id,
      ...notDeletedCondition,
    });

    /*
     * We should perform the following in this function:
     * - (1) Set the target transaction as deleted.
     * - (2) Update the property amount that the user has in the Users
     *   document after the transaction is reverted.
     * These operations should be atomic.
     */
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // === Soft delete transaction
      transaction.isDeleted = true;
      await transaction.save({ session });
      // === END Soft delete transaction

      // === Update user points
      if (property) {
        property.amount -= transaction.amountChange;
        if (property.amountInStock) {
          property.amountInStock += transaction.amountChange;
        }
        await property.save({ session });
        newAmount = property.amount;
      }
      // === END Update user points
    });
    session.endSession();

    return res.status(202).json({
      success: true,
      payload: {
        transaction,
        amount: newAmount,
      },
    });
  }
);

export { router as deleteTransactionRouter };
