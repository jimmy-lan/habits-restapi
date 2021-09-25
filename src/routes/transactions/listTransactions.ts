/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-22
 * Description:
 *   Route to list transactions with pagination for the signed-in user.
 *   Currently listing from the most recent to the least recent.
 */

import { Request, Response, Router } from "express";
import { Property, PropertyDocument, Transaction } from "../../models";
import { notDeletedCondition, validators } from "../../util";
import { ResBody } from "../../types";
import { validateRequest } from "../../middlewares";
import { query } from "express-validator";
import { NotFoundError } from "../../errors";

const router = Router();

const queryProperty = async (userId: string, propertyId?: string) => {
  let property: PropertyDocument | undefined;
  if (propertyId) {
    const _property = await Property.findOne({
      _id: propertyId as string,
      userId,
      ...notDeletedCondition,
    });
    if (!_property) {
      throw new NotFoundError(
        `Could not locate property with ID ${propertyId}.`
      );
    }
    property = _property;
  }
  return property;
};

router.get(
  "/",
  [
    validators.pageLimit,
    validators.pageSkip,
    query("propertyId").isString().isMongoId().optional(),
  ],
  validateRequest,
  async (req: Request, res: Response<ResBody>) => {
    const { skip, limit, propertyId } = req.query;
    const user = req.user!;

    // === Query requested property

    // === END Query requested property

    // === Query transactions
    const findLimit: number = limit ? Number(limit) : 0;
    const findSkip: number = skip ? Number(skip) : 0;

    const findCondition: Record<string, any> = {
      userId: user.id,
      ...notDeletedCondition,
    };
    if (property) {
      findCondition.property = property;
    }

    const transactions = await Transaction.find(findCondition)
      .sort({ createdAt: "desc" })
      .limit(findLimit)
      .skip(findSkip)
      .exec();
    // === END Query transactions

    return res.send({
      success: true,
      payload: transactions,
    });
  }
);

export { router as listTransactionsRouter };
