/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-25
 */

import { Request, Response, Router } from "express";
import { body, param } from "express-validator";
import mongoose from "mongoose";
import { validateRequest } from "../../middlewares";
import {
  Property,
  PropertyDocument,
  PropertyProps,
  Transaction,
} from "../../models";
import { BadRequestError, NotFoundError } from "../../errors";
import { ResBody } from "../../types";

const router = Router();

const assignFieldsToProperty = (
  property: PropertyDocument,
  fields: Partial<PropertyProps>
) => {
  const { name, description, amount, amountInStock } = fields;

  if (name) {
    property.name = name;
  }
  if (description) {
    property.description = description;
  }
  if (amount !== undefined) {
    // Find difference in values
    const diffAmount = amount - property.amount;
    if (!diffAmount) {
      throw new BadRequestError(
        "New amount specified must be different from the amount " +
          "that you currently have. The current amount " +
          `for ${property.name} is ${property.amount}.`
      );
    }
  }
  if (amountInStock) {
    property.amountInStock = amountInStock;
  }
};

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
  body("amount").isFloat({ min: 0 }).not().isString().optional(),
  body("amountInStock").isFloat({ min: 0 }).not().isString().optional(),
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
    const { amount } = req.body;
    const user = req.user!;

    // Find property
    const property = await Property.findById(propertyId);
    if (!property) {
      throw new NotFoundError("Could not locate this property.");
    }

    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // === Update user property
      assignFieldsToProperty(property, req.body);
      await property.save();
      // === END Update user property

      // === Create a transaction if amount is modified
      if (amount !== undefined) {
        const amountChange = amount - property.amount;
        await Transaction.create(
          [
            {
              userId: user.id,
              title: "Adjustment",
              property,
              amountChange,
            },
          ],
          { session }
        );
      }
      // === END Create a transaction is amount is modified
    });
    session.endSession();

    return res.json({
      success: true,
      payload: property,
    });
  }
);

export { router as modifyPropertiesRouter };
