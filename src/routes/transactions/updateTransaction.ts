/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-22
 * Description:
 *   Route to update a transaction and recalculate user points if needed.
 */

import { Request, Response, Router } from "express";
import { validateRequest } from "../../middlewares";
import { body, param } from "express-validator";
import { ResBody } from "../../types";
import { Property, PropertyDocument, Transaction } from "../../models";
import { notDeletedCondition } from "../../util";
import { NotFoundError } from "../../errors";
import mongoose, { ClientSession } from "mongoose";

const router = Router();

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
    const { transactionId } = req.params;
    const { title, amountChange, propertyId } = req.body;
    const user = req.user!;

    // Find transaction
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId: user.id,
      ...notDeletedCondition,
    })
      .populate("property", "_id name")
      .exec();
    if (!transaction) {
      throw new NotFoundError(
        `Transaction "${transactionId}" could not be found.`
      );
    }
    const transactionProperty = transaction.property as PropertyDocument;

    // Create a copy of the old transaction to return.
    const oldTransaction = transaction.toJSON();

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
      await transaction.save({ session });
      // === END Update transaction document

      // === Update user points, if needed
      if (diffAmount) {
        await updatePropertyAmount(
          user.id,
          transactionProperty._id as string,
          diffAmount,
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
