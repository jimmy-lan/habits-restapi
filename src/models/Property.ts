/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-22
 * Description:
 *   Model describing properties of a user. Each user should
 *   only have one property document entry.
 */

import { Document, Model, Schema } from "mongoose";
import { DeepRequired, Timestamp } from "../types";
import mongoose from "mongoose";

interface PropertyProps {
  /** ID of the user owning this property document. */
  userId: string;
  /** Number of points that the user has. Can be positive, negative, or 0. */
  points: number;
}

export type PropertyDocument = Document &
  DeepRequired<PropertyProps> &
  Timestamp;

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

export const Property = mongoose.model<PropertyDocument, PropertyModel>(
  "Property",
  propertySchema
);
