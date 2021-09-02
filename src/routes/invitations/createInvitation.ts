import { Request, Response, Router } from "express";
import { requireRoles, validateRequest } from "../../middlewares";
import { ResBody, UserRole } from "../../types";
import { body } from "express-validator";

const router = Router();

router.post(
  "/",
  requireRoles([UserRole.admin]),
  [
    body("email").isEmail().normalizeEmail(),
    body("sessionExpireAt")
      .optional()
      .isISO8601()
      .custom((str) => {
        return new Date(str) >= new Date(new Date().getTime() + 60 * 1000);
      })
      .withMessage("Session too short")
      .toDate(),
  ],
  validateRequest,
  (req: Request, res: Response<ResBody>) => {
    const { email, sessionExpireAt } = req.body;

    return res.status(201).json({
      success: true,
    });
  }
);

export { router as createInvitationRouter };
