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
import { Property, Transaction, TransactionDocument } from "../../models";
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

    // Find the property of interest
    const property = await Property.findOne({
      userId: user.id,
      _id: propertyId,
    });
    if (!property) {
      throw new NotFoundError("Could not locate this property.");
    }

    /*
     * We should perform the following in this function:
     * - (1) Create a new transaction for the current user, recording
     *   the information about this transaction.
     * - (2) Update the amount of property that the user has.
     * These operations should be atomic. For example, if (2) fails, we
     * should revert operation (1).
     */
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // === Add user points
      property.amount += amountChange;
      if (property.amountInStock) {
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
    });
    session.endSession();

    return res.status(201).json({
      success: true,
      payload: transaction!,
    });
  }
);

export { router as createTransactionRouter };
