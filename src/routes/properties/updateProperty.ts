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
import {
  BadRequestError,
  NotFoundError,
  UnprocessableEntityError,
} from "../../errors";
import { ResBody } from "../../types";

const router = Router();

const terminateIfExact = (field: string, current: any, next: any) => {
  if (current === next) {
    throw new BadRequestError(
      `New ${field} specified must be different from the ${field} ` +
        "that you currently have."
    );
  }
};

const assignFieldsToProperty = (
  property: PropertyDocument,
  fields: Partial<PropertyProps>
) => {
  const { name, description, amount, amountInStock } = fields;

  if (name) {
    terminateIfExact("name", property.name, name);
    property.name = name;
  }
  if (description) {
    terminateIfExact("description", property.description, description);
    property.description = description;
  }
  if (amount !== undefined) {
    terminateIfExact("amount", property.amount, amount);
    property.amount = amount;
  }
  if (amountInStock) {
    terminateIfExact("amount in stock", property.amountInStock, amountInStock);
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
    const { name, description, amount, amountInStock } = req.body;
    const user = req.user!;

    const definedValues = [name, description, amount, amountInStock].filter(
      (value) => !!value
    );
    if (!definedValues.length) {
      throw new UnprocessableEntityError(
        "Please specify at least one property field for this update."
      );
    }

    // Find property
    const property = await Property.findOne({
      userId: user.id,
      _id: propertyId,
    });
    if (!property) {
      throw new NotFoundError("Could not locate this property.");
    }

    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // === Create a transaction if amount is modified
      const oldAmount = property.amount;
      if (amount !== undefined) {
        const amountChange = amount - oldAmount;
        const transaction = Transaction.build({
          userId: user.id,
          title: "Adjustment",
          property,
          amountChange,
        });
        await transaction.save({ session });
      }
      // === END Create a transaction is amount is modified

      // === Update user property
      assignFieldsToProperty(property, req.body);
      await property.save({ session });
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
