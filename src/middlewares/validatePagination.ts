/*
 * Created by Jimmy Lan
 * Creation Date: 2021-09-13
 * Description: Validate pagination parameters.
 */

import { NextFunction, Request, Response } from "express";
import { validateRequest } from "./validateRequest";

const validatePagination = [
  (req: Request, res: Response, next: NextFunction) => {},
  validateRequest,
];
