/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-22
 */

import { Request, Response, Router } from "express";
import { ResBody } from "../../types";
import { Property } from "../../models";
import { NotFoundError } from "../../errors";

const router = Router();

router.get("/", async (req: Request, res: Response<ResBody>) => {
  const user = req.user!;

  const property = await Property.findOne({ userId: user.id });
  if (!property) {
    throw new NotFoundError("Could not locate property data for current user.");
  }

  return res.json({
    success: true,
    payload: property,
  });
});

export { router as getPropertiesRouter };
