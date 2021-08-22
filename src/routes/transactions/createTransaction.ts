/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-21
 * Description: Route to create a transaction.
 */

import { Request, Response, Router } from "express";
import { ResBody } from "../../types";

const router = Router();

router.post("/", (req: Request, res: Response<ResBody>) => {});

export { router as createTransactionRoute };
