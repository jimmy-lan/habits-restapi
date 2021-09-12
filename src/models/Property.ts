/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-22
 * Description:
 *   A property defined by the user. One user can correspond to many
 *   properties.
 */

import mongoose, { HookNextFunction, Model, Schema } from "mongoose";
import { MongoDocument } from "../types";
import { defaultUserLimits } from "../config";
import { UnprocessableEntityError } from "../errors";

// TODO Fix all `numTransactions` and `maxTransactions` usage from the old
// `Property` model.

interface PropertyProps {
  /** ID of the user owning this property document. */
  userId: string;
}

export type PropertyDocument = MongoDocument<PropertyProps>;

const propertySchema = new Schema<PropertyDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    points: {
      type: Number,
      required: true,
      default: 0,
    },
    numTransactions: {
      type: Number,
      required: true,
      default: 0,
    },
    maxTransactions: {
      type: Number,
      required: true,
      default: defaultUserLimits.maxTransactions,
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

export interface PropertyModel extends Model<PropertyDocument> {
  build(props: PropertyProps): PropertyDocument;
}

const build = (props: PropertyProps) => {
  return new Property(props);
};
propertySchema.static("build", build);
propertySchema.pre<PropertyDocument>(
  "save",
  async function (done: HookNextFunction) {
    // If the user has the maximum transaction count, throw an error
    if (this.numTransactions > this.maxTransactions) {
      throw new UnprocessableEntityError(
        `You reached the maximum transaction count ${this.maxTransactions}. ` +
          "Please email Jimmy to apply for a quota increase."
      );
    }
    done();
  }
);

export const Property = mongoose.model<PropertyDocument, PropertyModel>(
  "Property",
  propertySchema
);
