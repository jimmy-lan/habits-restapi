import { Request, Response, Router } from "express";
import { requireRoles, validateRequest } from "../../middlewares";
import { UserRole } from "../../types";
import { body } from "express-validator";

const router = Router();

router.post(
  "/",
  requireRoles([UserRole.admin]),
  [
    body("email").isEmail().normalizeEmail(),
    body("sessionExpireAt")
      .optional()
      .isDate()
      .toDate()
      .custom((sessionExpireAt) => {
        if (sessionExpireAt < new Date(new Date().getTime() + 5 * 1000)) {
          throw new Error("Session too short.");
        }
      }),
  ],
  validateRequest,
  (req: Request, res: Response) => {
    const { email, sessionExpireAt } = req.body;
    console.log(sessionExpireAt);
  }
);
