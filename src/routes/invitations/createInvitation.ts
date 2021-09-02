import { Request, Response, Router } from "express";
import { requireRoles, validateRequest } from "../../middlewares";
import { ResBody, UserRole } from "../../types";
import { body } from "express-validator";
import { Invitation } from "../../models";
import { PasswordEncoder } from "../../services";

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
  async (req: Request, res: Response<ResBody>) => {
    const { email, sessionExpireAt } = req.body;

    const invitation = await Invitation.build({
      email,
      code: PasswordEncoder.randomString(24),
      testSessionExpireAt: sessionExpireAt,
    });
    await invitation.save();

    return res.status(201).json({
      success: true,
      payload: invitation,
    });
  }
);

export { router as createInvitationRouter };
