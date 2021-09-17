/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-22
 */

import { Request, Response, Router } from "express";
import { ResBody } from "../../types";
import { Property } from "../../models";
import { validateRequest } from "../../middlewares";
import { query } from "express-validator";

const router = Router();

router.get(
  "/",
  [query("fields").isArray()],
  validateRequest,
  async (req: Request, res: Response<ResBody>) => {
    const { skip, limit } = req.query;
    const user = req.user!;

    const findLimit: number = limit ? Number(limit) : 0;
    const findSkip: number = skip ? Number(skip) : 0;

    const properties = await Property.find({ userId: user.id })
      .sort({ createdAt: "desc" })
      .skip(findSkip)
      .limit(findLimit)
      .exec();

    return res.json({
      success: true,
      payload: properties,
    });
  }
);

export { router as listPropertiesRouter };
