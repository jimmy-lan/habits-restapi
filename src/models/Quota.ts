/*
 * Created by Jimmy Lan
 * Creation date: 2021-09-12
 * Description:
 *    Each user will have one quota document to restrict the amount of resource
 *    that they can use. Users can apply for a quota increase by emailing us.
 */

import { MongoDocument } from "../types";
import mongoose, {
  ClientSession,
  HookNextFunction,
  Model,
  Schema,
} from "mongoose";
import { defaultQuota } from "../config";
import { QuotaExceededError } from "../errors";

// The deleted counts are not shown to the user, but if the
// amount of deleted items are suspicious, we suspend the user's
// account for investigation. The `limit` quota for deleted items are
// checked by scheduled workers, and the `usage` value for deleted items
// will be cleared after scheduled checks are completed.

interface QuotaRecord {
  transactions: number;
  transactionsDeleted: number;
  properties: number;
  propertiesDeleted: number;
}

interface QuotaProps {
  userId: string;
  limit: QuotaRecord;
  usage: QuotaRecord;
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

quotaSchema.pre<QuotaDocument>("save", function (this, done: HookNextFunction) {
  if (!this.isModified("usage")) {
    return done();
  }

  const quotaFieldsToCheck = Object.keys(this.usage) as (keyof QuotaRecord)[];
  for (const quotaField of quotaFieldsToCheck) {
    const fieldUsage = this.usage![quotaField];
    const fieldLimit = this.limit![quotaField];
    if (fieldUsage > fieldLimit) {
      throw new QuotaExceededError();
    }
  }

  return done();
});

export interface QuotaModel extends Model<QuotaDocument> {
  build(props: Partial<QuotaProps>): QuotaDocument;

  findOrCreateOne(
    userId: string,
    session?: ClientSession
  ): Promise<QuotaDocument>;
}

const build = (props: Partial<QuotaProps>) => {
  return new Quota(props);
};
const findOrCreateOne = async (userId: string, session?: ClientSession) => {
  console.log("find or create");
  let quota = await Quota.findOne({ userId }, null, { session });
  console.log(quota);
  if (!quota) {
    quota = Quota.build({ userId });
  }
  return quota;
};
quotaSchema.static("build", build);
quotaSchema.static("findOrCreateOne", findOrCreateOne);

export const Quota = mongoose.model<QuotaDocument, QuotaModel>(
  "Quota",
  quotaSchema
);
