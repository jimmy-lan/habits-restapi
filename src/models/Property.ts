/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-22
 * Description:
 *   A property defined by the user. One user can correspond to many
 *   properties.
 */

import mongoose, { HookNextFunction, Model, Schema } from "mongoose";
import { MongoDocument } from "../types";
import { UnprocessableEntityError } from "../errors";

// TODO Fix all `numTransactions` and `maxTransactions` usage from the old
//   `Property` model.

export interface PropertyProps {
  /** ID of the user owning this property document. */
  userId: string;
  /** Name of property. */
  name: string;
  /** Description of property. */
  description?: string;
  /** Number of this property own by user. */
  amount: number;
  /** Number of this property available to be obtained by the user.
   * Whenever the user obtains this property, this number will be reduced
   * by the amount that the user obtains. When this number drops to zero,
   * the user may not obtain more counts of this property. */
  amountInStock?: number;
  isDeleted?: boolean;
}

export type PropertyDocument = MongoDocument<PropertyProps>;

const propertySchema = new Schema<PropertyDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    amountInStock: Number,
    isDeleted: Boolean,
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
    // If the user does not have enough property in stock, throw an error
    if (this.amountInStock && this.amountInStock < 0) {
      throw new UnprocessableEntityError(
        `Sorry, you don't have enough stock for property ${this.name} left. ` +
          "If you still need to process this change in property, please update " +
          "the in stock setting of this item."
      );
    }
    done();
  }
);

export const Property = mongoose.model<PropertyDocument, PropertyModel>(
  "Property",
  propertySchema
);
