/*
 * Created by Jimmy Lan
 */

import { Request, Response, Router } from "express";
import { validateRequest } from "../../middlewares";
import { body } from "express-validator";

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
      .isLength({ min: 2, max: 100 })
      .withMessage(
        "Property description must be a string of length between 2 and 100."
      ),
    body("amountInStock").isNumeric(),
  ],
  validateRequest,
  (req: Request, res: Response) => {}
);

export { router as createPropertyRouter };
