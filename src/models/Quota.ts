/*
 * Created by Jimmy Lan
 * Creation date: 2021-09-12
 * Description:
 *    Each user will have one quota document to restrict the amount of resource
 *    that they can use. Users can apply for a quota increase by emailing us.
 */

// The deleted counts are not shown to the user, but if the
// amount of deleted items are suspicious, we suspend the user's
// account for investigation. The `max` quota for deleted items are
// checked by scheduled workers, and the `num` value will be cleared
// after scheduled checks are completed.

import { MongoDocument } from "../types";
import { Schema } from "mongoose";
import { defaultQuota } from "../config";

interface QuotaProps {
  /** Number of deleted transactions. */
  numDeletedTransactions: number;
  maxDeletedTransactions: number;
  /** Number of available (not-deleted) transactions. */
  numTransactions: number;
  maxTransactions: number;
  /** Number of deleted properties. */
  numDeletedProperties: number;
  maxDeletedProperties: number;
  /** Number of available (not-deleted) properties. */
  numProperties: number;
  maxProperties: number;
}

export type QuotaDocument = MongoDocument<QuotaProps>;

const getQuotaField = (defaultValue?: number) => ({
  type: Number,
  required: true,
  default: defaultValue || 0,
});

const quotaSchema = new Schema<QuotaDocument>({
  numDeletedTransactions: getQuotaField(),
  maxDeletedTransactions: getQuotaField(defaultQuota.maxDeletedTransactions),
  numTransactions: getQuotaField(),
  maxTransactions: getQuotaField(defaultQuota.maxTransactions),
  numDeletedProperties: getQuotaField(),
  maxDeletedProperties: getQuotaField(defaultQuota.maxDeletedProperties),
  numProperties: getQuotaField(),
  maxProperties: getQuotaField(defaultQuota.maxProperties),
});
