/*
 * Created by Jimmy Lan
 */

import { Request, Response, Router } from "express";
import { validateRequest } from "../../middlewares";
import { body } from "express-validator";
import { Property, Quota } from "../../models";
import { UnprocessableEntityError } from "../../errors";
import { ResBody } from "../../types";
import mongoose from "mongoose";

const router = Router();

router.post(
  "/",
  [
    body("name")
      .isString()
      .isLength({ min: 1, max: 50 })
      .withMessage(
        "Property name must be a string of length between 1 and 50."
      ),
    body("description")
      .isString()
      .isLength({ min: 2, max: 280 })
      .withMessage(
        "Property description must be a string of length between 2 and 100."
      )
      .optional(),
    body("amountInStock").isFloat({ gt: 0 }).optional(),
  ],
  validateRequest,
  async (req: Request, res: Response<ResBody>) => {
    const { name, description, amountInStock } = req.body;
    const user = req.user!;

    const existingProperty = await Property.findOne({ userId: user.id, name });
    if (existingProperty) {
      throw new UnprocessableEntityError(
        `You already have a property with name "${name}".`
      );
    }

    const property = Property.build({
      userId: user.id,
      name,
      description,
      amount: 0,
      amountInStock,
    });

    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      await property.save({ session });
      const quota = await Quota.findOrCreateOne(user.id, session);
      quota.usage.properties += 1;
      await quota.save({ session });
    });

    return res.status(201).json({
      success: true,
      payload: property,
    });
  }
);

export { router as createPropertyRouter };
