/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-22
 * Description:
 *   Route to delete a transaction and update the points count
 *   accordingly.
 */

import { Router, Request, Response } from "express";
import { requireAuth, validateRequest } from "../../middlewares";
import { ResBody } from "../../types";
import { query } from "express-validator";

const router = Router();

router.delete(
  "/:transactionId",
  requireAuth,
  [query("transactionId").notEmpty().isMongoId()],
  validateRequest,
  (req: Request, res: Response<ResBody>) => {
    const { transactionId } = req.query;
    const user = req.user!;

    /*
     * We should perform the following in this function:
     * - (1) Find the requested transaction for the current user.
     * - (2) Update the number of points that the user has in the Users
     *   document after the transaction is reverted.
     * These operations should be atomic. For example, if (2) fails, we
     * should revert operation (1).
     */
  }
);
