/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-25
 */

import { Request, Response, Router } from "express";
import { body, param } from "express-validator";
import mongoose from "mongoose";
import { validateRequest } from "../../middlewares";
import { Property, Transaction } from "../../models";
import { BadRequestError, NotFoundError } from "../../errors";
import { ResBody } from "../../types";

const router = Router();

const validationHandlers = [
  param("propertyId").isMongoId(),
  body("name")
    .isString()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Name of property must be a non-empty string.")
    .optional(),
  body("description")
    .isString()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Description of property must be a non-empty string.")
    .optional(),
  body("numOwn").isFloat({ min: 0 }).not().isString().optional(),
  body("numInStock").isFloat({ min: 0 }).not().isString().optional(),
];

/**
 * Route to adjust user points. This will set user points to a fixed number,
 * and an adjustment transaction will be created automatically to reflect
 * this.
 */
router.patch(
  "/:propertyId",
  validationHandlers,
  validateRequest,
  async (req: Request, res: Response<ResBody>) => {
    const { propertyId } = req.params;
    const { name, description, numOwn, numInStock } = req.body;
    const user = req.user!;

    // Find property
    const property = await Property.findById(propertyId);
    if (!property) {
      throw new NotFoundError("Could not locate this property.");
    }

    if (name) {
      property.name = name;
    }
    if (description) {
      property.description = description;
    }
    if (numInStock) {
      property.numInStock = numInStock;
    }
    if (numOwn) {
      // Find difference in values
      const diffValue = numOwn - property.numOwn;
      if (!diffValue) {
        throw new BadRequestError(
          "New amount specified must be different from the amount " +
            "that you currently have. The current amount " +
            `for ${property.name} is ${property.numOwn}.`
        );
      }
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
