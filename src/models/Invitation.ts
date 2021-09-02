/*
 * The invitations collection is created to accommodate test server
 * requirements. Only users with invitations may sign up in test.
 * The documents in this collection also records other useful information
 * for test server users.
 */

interface Invitation {
  /** Email of the user invited. */
  email: string;
  /** A random code to verify user's identity. This code is required when
   * a test server user fills out surveys and perform other activities that
   * is outside the scope of this program. */
  code: string;
  /** Indicates whether this invitation has been accepted. */
  isAccepted: boolean;
  /** Timestamp when the user accepted this invitation and begin their test
   * session. */
  testSessionStartAt?: Date;
  /** Timestamp of the expiry time of user account. If empty, this test account
   * will never expire. */
  testSessionExpireAt?: Date;
}
