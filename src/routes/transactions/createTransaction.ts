/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-21
 * Description: Route to create a transaction.
 */

import { Request, Response, Router } from "express";
import { ResBody } from "../../types";
import { requireAuth, validateRequest } from "../../middlewares";
import { body } from "express-validator";

const router = Router();

router.post(
  "/",
  requireAuth,
  [body("pointsChange").isInt().not().equals("0")],
  validateRequest,
  (req: Request, res: Response<ResBody>) => {
    return res.json({
      success: true,
    });
  }
);

export { router as createTransactionRoute };
