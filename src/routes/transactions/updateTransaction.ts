/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-22
 * Description:
 *   Route to update a transaction and recalculate user points if needed.
 */

import { Request, Response, Router } from "express";
import { validateRequest } from "../../middlewares";
import { body, param } from "express-validator";
import { MongoDocument, ResBody } from "../../types";
import { Property, PropertyDocument, Transaction } from "../../models";
import { notDeletedCondition } from "../../util";
import { NotFoundError } from "../../errors";
import mongoose, { ClientSession } from "mongoose";

const router = Router();

const updateOldAndNewPropertyAmount = async (
  userId: string,
  oldPropertyId: string,
  newPropertyId: string,
  oldAmountChange: number,
  newAmountChange: number,
  session: ClientSession
) => {
  const oldProperty = await Property.findOne({ _id: oldPropertyId, userId });
  if (!oldProperty) {
    throw new NotFoundError("Could not locate old property data.");
  }
  oldProperty.amount -= oldAmountChange;
  if (oldProperty.amountInStock) {
    oldProperty.amountInStock += oldAmountChange;
  }
  await oldProperty.save({ session });

  const newProperty = await Property.findOne({ _id: newPropertyId, userId });
  if (!newProperty) {
    throw new NotFoundError("Could not locate new property data.");
  }
  newProperty.amount += newAmountChange;
  if (newProperty.amountInStock) {
    newProperty.amountInStock -= newAmountChange;
  }
  await newProperty.save({ session });
};

const updatePropertyAmount = async (
  userId: string,
  propertyId: string,
  diffAmount: number,
  session: ClientSession
) => {
  const property = await Property.findOne({ _id: propertyId, userId });
  if (!property) {
    throw new NotFoundError("Could not locate property data.");
  }
  property.amount += diffAmount;
  if (property.amountInStock) {
    property.amountInStock -= diffAmount;
  }
  await property.save({ session });
};

const getDiffAmount = (oldAmount: number, newAmount: number) => {
  return newAmount - oldAmount;
};

router.patch(
  "/:transactionId",
  [
    param("transactionId").notEmpty().isMongoId(),
    body("title")
      .optional()
      .isString()
      .isLength({ min: 2, max: 80 })
      .withMessage(
        "Title must be a valid string with length between 2 and 80."
      ),
    body("amountChange")
      .optional()
      .isNumeric()
      .not()
      .equals("0")
      .not()
      .isString(),
    body("propertyId").optional().isMongoId(),
  ],
  validateRequest,
  async (req: Request, res: Response<ResBody>) => {
    const { transactionId } = req.params;
    const { title, amountChange, propertyId } = req.body;
    const user = req.user!;

    // Find transaction
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId: user.id,
      ...notDeletedCondition,
    })
      .populate("property", "name")
      .exec();
    if (!transaction) {
      throw new NotFoundError(
        `Transaction "${transactionId}" could not be found.`
      );
    }
    let transactionProperty = transaction.property as PropertyDocument;

    // Create a copy of the old transaction to return.
    const oldTransaction = transaction.toJSON();
    const oldPropertyId = transactionProperty._id as string;
    const oldAmountChange = transaction.amountChange as number;

    // Amount of property to add to the user, as a result of this modification.
    let diffAmount = 0;
    // amoungChange can't be 0, so this is good.
    if (amountChange) {
      diffAmount = getDiffAmount(transaction.amountChange, amountChange);
    }

    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // === Update transaction document
      if (title) {
        transaction.title = title;
      }
      if (amountChange) {
        transaction.amountChange = amountChange;
      }
      if (propertyId) {
        transaction.property = propertyId;
      }
      await transaction.save({ session });
      await transaction.populate("property", "name").execPopulate();
      transactionProperty = transaction.property as PropertyDocument;
      // === END Update transaction document

      // === Update user points, if needed
      if ((!propertyId || oldPropertyId == propertyId) && diffAmount) {
        await updatePropertyAmount(
          user.id,
          transactionProperty._id as string,
          diffAmount,
          session
        );
      } else if (propertyId && oldPropertyId != propertyId) {
        await updateOldAndNewPropertyAmount(
          user.id,
          oldPropertyId,
          propertyId,
          oldAmountChange,
          amountChange ? amountChange : oldAmountChange,
          session
        );
      }
      // === END Update user points
    });
    session.endSession();

    return res.json({
      success: true,
      payload: {
        transaction,
        updatedFrom: oldTransaction,
      },
    });
  }
);

export { router as modifyTransactionRouter };
