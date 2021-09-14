/*
 * Created by Jimmy Lan
 * Creation Date: 2021-09-13
 * Description: Validate pagination parameters.
 */

import { validateRequest } from "./validateRequest";
import { query } from "express-validator";

export const validatePagination = [
  query("limit").optional().isInt({ gt: 0 }),
  query("skip").optional().isInt({ gt: 0 }),
  validateRequest,
];
