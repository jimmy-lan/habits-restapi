import { Document } from "mongoose";
import { DeepRequired } from "./DeepRequired";
import { Timestamp } from "./Timestamp";

/**
 * A type for mongodb document with its document structure
 * defined as `T`.
 */
export type MongoDocument<T> = Document<string> & DeepRequired<T> & Timestamp;
