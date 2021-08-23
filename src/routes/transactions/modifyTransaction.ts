/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-22
 * Description:
 *   Route to update a transaction and recalculate user points if needed.
 */

import { Router, Request, Response } from "express";
import { requireAuth, validateRequest } from "../../middlewares";
import { body, param } from "express-validator";
import { ResBody } from "../../types";
import { Property, Transaction } from "../../models";
import { notDeletedCondition } from "../../util";
import { NotFoundError } from "../../errors";
import mongoose from "mongoose";

const router = Router();

const updateUserPoints = async (userId: string, diffPoints: number) => {
  const property = await Property.findOne({ userId });
  if (!property) {
    throw new NotFoundError(
      "Could not locate property data for the current user."
    );
  }
  property.points += diffPoints;
  const savedProperty = await property.save();
  return savedProperty.points;
};

const getDiffPoints = (oldPoints: number, newPoints: number) => {
  return newPoints - oldPoints;
};

router.patch(
  "/:transactionId",
  requireAuth,
  [
    param("transactionId").notEmpty().isMongoId(),
    body("title")
      .optional()
      .notEmpty()
      .isString()
      .isLength({ min: 2, max: 80 }),
    body("pointsChange").optional().isInt().not().equals("0").not().isString(),
  ],
  validateRequest,
  async (req: Request, res: Response<ResBody>) => {
    const { transactionId } = req.params;
    const { title, pointsChange } = req.body;
    const user = req.user!;

    // Find transaction
    const transaction = await Transaction.findOne({
      userId: user.id,
      transactionId,
      ...notDeletedCondition,
    });
    if (!transaction) {
      throw new NotFoundError(
        `Transaction "${transactionId}" could not be found.`
      );
    }

    // Number of points to add to the user, as a result of this modification.
    let diffPoints = 0;
    // pointsChange can't be 0, so this is good.
    if (pointsChange) {
      diffPoints = getDiffPoints(transaction.pointsChange, pointsChange);
    }

    // These values will be updated and returned
    let newPoints = 0;

    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // === Update transaction document
      if (title) {
        transaction.title = title;
      }
      if (pointsChange) {
        transaction.pointsChange = pointsChange;
      }
      await transaction.save();
      // === END Update transaction document

      // === Update user points, if needed
      if (pointsChange) {
        newPoints = await updateUserPoints(user.id, diffPoints);
      }
      // === END Update user points
    });
    session.endSession();

    return res.json({
      success: true,
      payload: {
        transaction,
        points: newPoints,
      },
    });
  }
);

export { router as modifyTransactionRouter };
