/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-25
 */

import { Request, Response, Router } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import { validateRequest } from "../../middlewares";
import { Property, Transaction } from "../../models";
import { BadRequestError, NotFoundError } from "../../errors";
import { ResBody } from "../../types";

const router = Router();

/**
 * Route to adjust user points. This will set user points to a fixed number,
 * and an adjustment transaction will be created automatically to reflect
 * this.
 */
router.patch(
  "/",
  [body("points").isNumeric().not().isString()],
  validateRequest,
  async (req: Request, res: Response<ResBody>) => {
    const { points } = req.body;
    const user = req.user!;

    // Find difference in points
    const property = await Property.findOne({ userId: user.id });
    if (!property) {
      throw new NotFoundError(
        "Could not locate property data for current user."
      );
    }
    const diffPoints = points - property.points;
    if (!diffPoints) {
      throw new BadRequestError(
        "New points specified must be different from the number of points " +
          "that you currently have. You currently have " +
          property.points +
          " points."
      );
    }

    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // === Create a transaction with `diffPoints`
      await Transaction.create(
        [
          {
            userId: user.id,
            title: "Adjustment",
            pointsChange: diffPoints,
          },
        ],
        { session }
      );
      // === END Create a transaction with `diffPoints`

      // === Update user property
      property.points = points;
      property.numTransactions++;
      await property.save();
      // === END Update user property
    });
    session.endSession();

    return res.json({
      success: true,
      payload: property,
    });
  }
);

export { router as modifyPropertiesRouter };
