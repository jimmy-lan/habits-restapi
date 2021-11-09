/*
 * Created by Jimmy Lan
 * Creation date: 2021-09-12
 * Description:
 *    Each user will have one quota document to restrict the amount of resource
 *    that they can use. Users can apply for a quota increase by emailing us.
 */

import { MongoDocument } from "../types";
import mongoose, { Model, Schema } from "mongoose";
import { defaultQuota } from "../config";

// The deleted counts are not shown to the user, but if the
// amount of deleted items are suspicious, we suspend the user's
// account for investigation. The `max` quota for deleted items are
// checked by scheduled workers, and the `num` value will be cleared
// after scheduled checks are completed.
interface QuotaRecord {
  transactions: number;
  transactionsDeleted: number;
  properties: number;
  propertiesDeleted: number;
}

export interface QuotaProps {
  userId: string;
  limit?: Partial<QuotaRecord>;
  usage?: Partial<QuotaRecord>;
}

export type QuotaDocument = MongoDocument<QuotaProps>;

const getQuotaField = (defaultValue?: number) => ({
  type: Number,
  required: true,
  default: defaultValue || 0,
});

const quotaSchema = new Schema<QuotaDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    limit: {
      transactions: getQuotaField(defaultQuota.maxTransactions),
      transactionsDeleted: getQuotaField(defaultQuota.maxTransactionsDeleted),
      properties: getQuotaField(defaultQuota.maxProperties),
      propertiesDeleted: getQuotaField(defaultQuota.maxPropertiesDeleted),
    },
    usage: {
      transactions: getQuotaField(),
      transactionsDeleted: getQuotaField(),
      properties: getQuotaField(),
      propertiesDeleted: getQuotaField(),
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
      versionKey: false,
    },
  }
);

export interface QuotaModel extends Model<QuotaDocument> {
  build(props: QuotaProps): QuotaDocument;
}

const build = (props: QuotaProps) => {
  return new Quota(props);
};
quotaSchema.static("build", build);

export const Quota = mongoose.model<QuotaDocument, QuotaModel>(
  "Quota",
  quotaSchema
);
