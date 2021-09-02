/*
 * Created by Jimmy Lan
 * Creation Date: 2021-09-02
 */
import { UnauthorizedError } from "../errors";
import { UserDocument } from "../models";
import { LeanDocument } from "mongoose";

/*
 * Only applicable to test server users.
 * Test server users need to be invited to our service. Users may be
 * restricted to a window of time when they can use the service.
 * This helper function throws an error if the test user's session expired.
 */
export const ensureValidTestSession = (
  user: UserDocument | LeanDocument<UserDocument>
) => {
  const now = new Date();
  const expireTime = new Date(user.invitation?.testSessionExpireAt as Date);
  if (expireTime <= now) {
    throw new UnauthorizedError(
      "Thank you for participating in the testing of the habits app. " +
        "We are currently outside of your test session time. Your test session " +
        `expired at "${expireTime.toString()}".`
    );
  }
};
