/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-22
 */

import { Request, Response, Router } from "express";
import { ResBody } from "../../types";
import { Property } from "../../models";

const router = Router();

router.get("/", async (req: Request, res: Response<ResBody>) => {
  const user = req.user!;

  const properties = await Property.find({ userId: user.id });

  return res.json({
    success: true,
    payload: properties,
  });
});

export { router as getPropertiesRouter };
