import { NextFunction, Request, Response, Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../../middlewares";
import { Invitation } from "../../models";
import { invitationIPRateLimiter } from "../../services";
import { setRateLimitErrorHeaders } from "../../util";
import { RateLimitedError } from "../../errors";

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
  async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const { email } = req.body;

    try {
      await invitationIPRateLimiter.consume(ip);
    } catch (rateLimiterRes) {
      setRateLimitErrorHeaders(res, rateLimiterRes);
      throw new RateLimitedError();
    }

    // Find invitation
    const invitation = await Invitation.findOne({ email });
  }
);

export { router as activateInvitationRouter };
