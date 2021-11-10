import mongoose from "mongoose";
import { Request, Response, Router } from "express";
import { param } from "express-validator";
import { validateRequest } from "../../middlewares";
import { Property, Quota, Transaction } from "../../models";
import { notDeletedCondition } from "../../util";
import { NotFoundError } from "../../errors";

const router = Router();

router.delete(
  "/:propertyId",
  [param("propertyId").notEmpty().isMongoId()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { propertyId } = req.params;
    const user = req.user!;

    // Check if property exists
    const property = await Property.findOne({
      userId: user.id,
      _id: propertyId,
      ...notDeletedCondition,
    });
    if (!property) {
      throw new NotFoundError(`Property "${propertyId}" could not be found.`);
    }

    // These values will be populated and returned
    let numTransactionsAffected = 0;

    // We need to remove the property together with all transactions
    // for this property.
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // === Soft delete property
      property.isDeleted = true;
      await property.save({ session });
      // === END Soft delete property

      // === Soft delete all transactions with this property
      const writeResult = await Transaction.updateMany(
        {
          userId: user.id,
          property: propertyId,
          ...notDeletedCondition,
        },
        { $set: { isDeleted: true } },
        { session }
      );
      numTransactionsAffected = writeResult.nModified;
      // === END Soft delete all transactions with this property

      // === Update quota
      const quota = await Quota.findOrCreateOne(user.id, session);
      quota.usage.properties -= 1;
      quota.usage.propertiesDeleted += 1;
      quota.usage.transactions -= numTransactionsAffected;
      quota.usage.transactionsDeleted += numTransactionsAffected;
      await quota.save({ session });
      // === END Update quota
    });
    session.endSession();

    return res.status(202).json({
      success: true,
      payload: {
        property,
        numTransactionsAffected,
      },
    });
  }
);

export { router as deletePropertyRouter };
