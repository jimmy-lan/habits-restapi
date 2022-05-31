/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-21
 * Description:
 *   Route to create a transaction and update property amount for the current
 *   user.
 */

import { Request, Response, Router } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import { ResBody } from "../../types";
import { validateRequest } from "../../middlewares";
import {
  Property,
  Quota,
  Transaction,
  TransactionDocument,
} from "../../models";
import { NotFoundError } from "../../errors";

const router = Router();

router.post(
  "/",
  [
    body("propertyId")
      .isString()
      .isMongoId()
      .withMessage("Property ID must be a valid object ID."),
    body("title")
      .optional()
      .isString()
      .isLength({ min: 2, max: 80 })
      .withMessage(
        "Title must be a valid string with length between 2 and 80."
      ),
    body("amountChange").isNumeric().not().equals("0").not().isString(),
  ],
  validateRequest,
  async (req: Request, res: Response<ResBody>) => {
    const { title, amountChange, propertyId } = req.body;
    const user = req.user!;

    // These values will be populated and returned
    let transaction: TransactionDocument;

    const property = await Property.findOne({
      userId: user.id,
      _id: propertyId,
    });
    if (!property) {
      throw new NotFoundError("Could not locate this property.");
    }

    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // === Add user points
      property.amount += amountChange;
      if (property.amountInStock !== undefined) {
        property.amountInStock -= amountChange;
      }
      await property.save({ session });
      // === END Add user points

      // === Add transaction
      transaction = Transaction.build({
        userId: user.id,
        title: title || "Untitled transaction",
        amountChange,
        property,
      });
      await transaction.save({ session });
      // === END Add transaction

      // === Update quota
      const quota = await Quota.findOrCreateOne(user.id, session);
      quota.usage.transactions += 1;
      await quota.save({ session });
      // === END Update quota
    });
    session.endSession();

    return res.status(201).json({
      success: true,
      payload: transaction!,
    });
  }
);

export { router as createTransactionRouter };
