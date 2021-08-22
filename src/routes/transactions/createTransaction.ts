/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-21
 * Description:
 *   Route to create a transaction and update points count for the current
 *   user.
 */

import { Request, Response, Router } from "express";
import { ResBody } from "../../types";
import { requireAuth, validateRequest } from "../../middlewares";
import { body } from "express-validator";
import * as mongoose from "mongoose";

const router = Router();

router.post(
  "/",
  requireAuth,
  [
    body("title").optional().isString().isLength({ min: 2, max: 80 }),
    body("pointsChange").isInt().not().equals("0").not().isString(),
  ],
  validateRequest,
  async (req: Request, res: Response<ResBody>) => {
    const { title, pointsChange } = req.body;

    const session = await mongoose.startSession();

    await session.withTransaction(async () => {});

    session.endSession();

    return res.json({
      success: true,
    });
  }
);

export { router as createTransactionRouter };
