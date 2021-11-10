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
      }
      // === END Update user points
    });
    session.endSession();

    return res.status(202).json({
      success: true,
      payload: transaction,
    });
  }
);

export { router as deleteTransactionRouter };
