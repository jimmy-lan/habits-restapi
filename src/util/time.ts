/*
 * Created by Jimmy Lan
 * Creation Date: 2021-09-02
 */
import { UnauthorizedError } from "../errors";

/*
 * Only applicable to test server users.
 * Test server users need to be invited to our service. Users may be
 * restricted to a window of time when they can use the service.
 * This helper function throws an error if the test user's session expired.
 */
export const ensureValidTestSession = (testSessionExpireAt: Date) => {
  const now = new Date();
  const expireTime = new Date(testSessionExpireAt);
  if (expireTime <= now) {
    throw new UnauthorizedError(
      "Thank you for participating in the testing of the habits app. " +
        "We are currently outside of your test session time. Your test session " +
        `expired at "${expireTime.toString()}".`
    );
  }
};
