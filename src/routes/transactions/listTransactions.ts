/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-22
 * Description:
 *   Route to list transactions with pagination for the signed-in user.
 *   Currently listing from the most recent to the least recent.
 */

import { Request, Response, Router } from "express";
import { Transaction } from "../../models";
import { notDeletedCondition, validators } from "../../util";
import { ResBody } from "../../types";
import { validateRequest } from "../../middlewares";
import { query } from "express-validator";

const router = Router();

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

    // === Query transactions
    const findLimit: number = limit ? Number(limit) : 0;
    const findSkip: number = skip ? Number(skip) : 0;

    const transactions = await Transaction.find({
      userId: user.id,
      ...notDeletedCondition,
    })
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
