import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../../middlewares";
import { Invitation, InvitationDocument } from "../../models";
import { invitationIPRateLimiter } from "../../services";
import { setRateLimitErrorHeaders } from "../../util";
import { NotFoundError, RateLimitedError } from "../../errors";
import { ResBody } from "../../types";

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
  async (req: Request, res: Response<ResBody>) => {
    const ip = req.clientIp!;
    const { email } = req.body;

    try {
      await invitationIPRateLimiter.consume(ip);
    } catch (rateLimiterRes) {
      setRateLimitErrorHeaders(res, rateLimiterRes);
      throw new RateLimitedError();
    }

    // Find invitation
    const invitation: InvitationDocument | null = await Invitation.findOne({
      email,
    });
    if (!invitation || invitation.isAccepted) {
      throw new NotFoundError(
        `Fail to activate - ${email} does not have an invitation.`
      );
    }

    // Update invitation
    invitation.isAccepted = true;
    invitation.clientIP = ip;
    invitation.testSessionStartAt = new Date();
    await invitation.save();

    // Return some useful information
    return res.json({
      success: true,
      payload: {
        testSessionStartAt: invitation.testSessionStartAt,
        testSessionExpireAt: invitation.testSessionExpireAt,
        serverName: process.env.SERVER_NAME,
        serverLocation: process.env.LOCATION,
        testPhase: process.env.TEST_PHASE,
        email: invitation.email,
      },
    });
  }
);

export { router as activateInvitationRouter };
