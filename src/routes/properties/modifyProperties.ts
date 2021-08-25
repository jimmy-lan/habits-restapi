/*
* Created by Jimmy Lan
* Creation Date: 2021-08-25
*/

import { Request, Response, Router } from "express";
import { requireAuth, validateRequest } from "../../middlewares";
import { body } from "express-validator";

const router = Router();

/**
 * Route to adjust user points. This will set user points to a fixed number,
 * and an adjustment transaction will be created automatically to reflect
 * this.
 */
router.patch("/", requireAuth, [
  body("points").isInt().not().isString()
], validateRequest, async (req: Request, res: Response) => {
  const {points} = req.body;
  const user = req.user!;


});
