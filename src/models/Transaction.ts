/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-21
 * Description: File holding a transaction model.
 */

import { Document, Model, Schema } from "mongoose";
import mongoose from "mongoose";
import { Timestamp } from "../types/Timestamp";

export interface TransactionProps {
  /** ID of the user who owns this transaction. */
  userId: string;
  /** Title of this transaction. */
  title: string;
  /** Change in points. A positive number means points are added.
   * A negative number means points are deducted. */
  pointsChange: number;
  isDeleted: boolean;
}

export type TransactionDocument = Document<TransactionProps> & Timestamp;

const transactionSchema = new Schema<TransactionDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      max: 80,
      min: 2,
    },
    pointsChange: {
      type: Number,
      required: true,
    },
    isDeleted: Boolean,
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.userId;
        delete ret.__v;
        delete ret.isDeleted;
      },
      versionKey: false,
    },
  }
);

export interface TransactionModel extends Model<TransactionDocument> {
  build(props: Partial<TransactionProps>): TransactionDocument;
}

const build = (props: Partial<TransactionProps>) => {
  return new Transaction(props);
};
transactionSchema.static("build", build);

export const Transaction = mongoose.model<
  TransactionDocument,
  TransactionModel
>("Transaction", transactionSchema);
