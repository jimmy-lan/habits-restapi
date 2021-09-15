/*
 * Created by Jimmy Lan
 */

import { Request, Response, Router } from "express";
import { validateRequest } from "../../middlewares";

const router = Router();

router.post("/", [], validateRequest, (req: Request, res: Response) => {});

export { router as createPropertyRouter };
