/*
 * Created by Jimmy Lan
 * Creation Date: 2021-03-09
 */

import { Request, Response, Router } from "express";
import { body } from "express-validator";

import { validateRequest } from "../../middlewares";
import { User } from "../../models";
import { RateLimitedError, UnauthorizedError } from "../../errors";
import {
  authBruteIPRateLimiter,
  PasswordEncoder,
  signInRateLimiter,
} from "../../services";
import { AuthResBody } from "../../types";
import {
  ensureValidTestSession,
  setRateLimitErrorHeaders,
  signTokens,
} from "../../util";

const router = Router();

router.post(
  "/signin",
  [
    body("email")
      .normalizeEmail({ gmail_remove_dots: false })
      .isEmail()
      .isLength({ min: 6, max: 80 }),
    body("password").notEmpty(),
  ],
  validateRequest,
  async (req: Request, res: Response<AuthResBody>) => {
    const ip = req.ip;
    const { email, password } = req.body;
    const emailIpPair = `${email}${ip}`;
    const invalidCredentialsMessage = "Invalid email or password.";

    // Rate limiting
    try {
      await signInRateLimiter.consume(emailIpPair);
      await authBruteIPRateLimiter.consume(ip);
    } catch (rateLimiterRes) {
      if (rateLimiterRes instanceof Error) {
        throw rateLimiterRes;
      }
      setRateLimitErrorHeaders(res, rateLimiterRes);
      throw new RateLimitedError();
    }

    // Find user
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new UnauthorizedError(invalidCredentialsMessage);
    }

    // Verify password
    const isMatch = await PasswordEncoder.compare(
      password,
      existingUser.password
    );
    if (!isMatch) {
      throw new UnauthorizedError(invalidCredentialsMessage);
    }

    // Ensure valid user testing session
    ensureValidTestSession(existingUser);

    // Clear rate limit
    await signInRateLimiter.delete(emailIpPair);
    await authBruteIPRateLimiter.delete(ip);

    const [refreshToken, accessToken] = await signTokens(
      existingUser,
      true,
      res
    );
    const payload = {
      refreshToken: refreshToken,
      accessToken: accessToken,
      user: existingUser,
    };

    return res.json({
      success: true,
      payload,
    });
  }
);

export { router as signInRouter };
