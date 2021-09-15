/*
 * Created by Jimmy Lan
 * Creation Date: 2021-03-03
 */

import { Request, Response, Router } from "express";
import { body } from "express-validator";

import { AuthResBody, UserRole } from "../../types";
import { Invitation, InvitationDocument, User } from "../../models";
import { validateRequest } from "../../middlewares";
import { BadRequestError, UnprocessableEntityError } from "../../errors";
import { PasswordEncoder } from "../../services";
import { ensureValidTestSession, signTokens } from "../../util";
import { tokenConfig } from "../../config";
import mongoose from "mongoose";

const router = Router();

/**
 * Check if user with <email> exists. If true, throw
 * an error to terminate the process.
 *
 * @param email user's email to be check
 * @throws BadRequestError
 */
const abortIfUserExists = async (email: string) => {
  const existingUser = await User.findOne({ email }).lean();

  if (existingUser) {
    const errorMessage = `Email ${email} is in use.`;
    throw new BadRequestError(errorMessage);
  }
};

/**
 * Used by test server only. Checks if `email` has an invitation to register.
 * If not, throw an appropriate `UnprocessableEntityError`. Otherwise, return
 * the invitation document for this `email`.
 * @param email
 * @throws UnprocessableEntityError
 */
const checkInvitation = async (email: string) => {
  const invitation: InvitationDocument | null = await Invitation.findOne({
    email,
  });
  if (!invitation) {
    throw new UnprocessableEntityError(
      "Thank you for your interest in the habits app! " +
        "We are currently doing closed alpha and beta testing at the moment, " +
        "and user testing individuals must have an invitation in order " +
        "to sign up. Please contact jimmylanbcn@gmail.com to apply for " +
        "participation. Thank you!"
    );
  }
  if (!invitation.isAccepted) {
    throw new UnprocessableEntityError(
      "Welcome! Please activate your invitation before signing up. " +
        "On habits CLI, " +
        `you may run "habits invitation activate ${email}" to proceed. `
    );
  }
  return invitation;
};

router.post(
  "/signup",
  [
    body("email")
      .normalizeEmail({ gmail_remove_dots: false })
      .isEmail()
      .isLength({ min: 6, max: 80 }),
    // TODO Implement a stricter password security check
    body("password").isLength({ min: 6, max: 50 }),
    body("firstName")
      .isString()
      .isLength({ min: 2, max: 50 })
      .not()
      .contains(" "),
    body("lastName")
      .isString()
      .isLength({ min: 2, max: 50 })
      .not()
      .contains(" "),
  ],
  validateRequest,
  async (req: Request, res: Response<AuthResBody>) => {
    const { email, password, firstName, lastName } = req.body;

    await abortIfUserExists(email);

    // Check user invitation
    const invitation = await checkInvitation(email);

    const user = User.build({
      email,
      password,
      clientSecret: PasswordEncoder.randomString(
        tokenConfig.clientSecretLength
      ),
      profile: { name: { first: firstName, last: lastName } },
      role: UserRole.member,
      invitation: {
        testSessionExpireAt: invitation.testSessionExpireAt as Date,
        details: invitation,
      },
    });

    // Test server only
    ensureValidTestSession(user);

    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // Save new user
      await user.save({ session });
    });
    session.endSession();

    const [refreshToken, accessToken] = await signTokens(user);
    const payload = { refreshToken, accessToken, user };

    return res.status(201).json({ success: true, payload });
  }
);

export { router as signUpRouter };
