import { NextFunction, Request, Response, Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../../middlewares";

const router = Router();

/**
 * Test server users need to activate invitation before signing themselves up.
 * This route will return some test server information, helpful links, together
 * with their test session info. This route also activates the invitation.
 */
router.post(
  "/activate",
  [body("email").isEmail().normalizeEmail()],
  validateRequest,
  (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    // Find invitation
  }
);

export { router as activateInvitationRouter };
