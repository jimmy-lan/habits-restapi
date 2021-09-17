/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-21
 * Description: File holding a transaction model.
 */

import mongoose, { Model, Schema } from "mongoose";
import { MongoDocument } from "../types";
import { PropertyDocument } from "./Property";

export interface TransactionProps {
  /** ID of the user who owns this transaction. */
  userId: string;
  /** Title of this transaction. */
  title?: string;
  /** Property that this transaction applies to. */
  property: string | PropertyDocument;
  /** Change in property amount. A positive number means an increase in amount.
   * A negative number means a deduction of amount. */
  amountChange: number;
  isDeleted?: boolean;
}

export type TransactionDocument = MongoDocument<TransactionProps>;

const transactionSchema = new Schema<TransactionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    title: {
      type: String,
      required: true,
      max: 80,
      min: 2,
    },
    property: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Property",
      index: true,
    },
    amountChange: {
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
  build(props: TransactionProps): TransactionDocument;
}

const build = (props: TransactionProps) => {
  return new Transaction(props);
};
transactionSchema.static("build", build);

export const Transaction = mongoose.model<
  TransactionDocument,
  TransactionModel
>("Transaction", transactionSchema);
