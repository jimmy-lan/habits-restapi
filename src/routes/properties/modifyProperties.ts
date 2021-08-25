/*
* Created by Jimmy Lan
* Creation Date: 2021-08-25
*/

import { Request, Response, Router } from "express";
import { requireAuth, validateRequest } from "../../middlewares";
import { body } from "express-validator";
import mongoose from "mongoose";
import { Property } from "../../models";
import { NotFoundError } from "../../errors";

const router = Router();

/**
 * Route to adjust user points. This will set user points to a fixed number,
 * and an adjustment transaction will be created automatically to reflect
 * this.
 */
router.patch("/", requireAuth, [
  body("points").isInt().not().isString(),
], validateRequest, async (req: Request, res: Response) => {
  const { points } = req.body;
  const user = req.user!;

  // Find difference in points
  const property = await Property.findOne({ userId: user.id });
  if (!property) {
    throw new NotFoundError("Could not locate property data for current user.");
  }
  const diffPoints = points - property.points;

  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    // === Create a transaction with `diffPoints`

    // === END Create a transaction with `diffPoints`

    // === Update user property

    // === END Update user property
  });
  session.endSession();
});
