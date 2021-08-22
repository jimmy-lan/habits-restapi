/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-22
 * Description:
 *   Model describing properties of a user. Each user should
 *   only have one property document entry.
 */

import { Document } from "mongoose";
import { Timestamp } from "../types/Timestamp";

interface PropertyProps {
  /** ID of the user owning this property document. */
  userId: string;
  /** Number of points that the user has. */
  points: number;
}

export type PropertyDocument = Document<PropertyProps> &
  PropertyProps &
  Timestamp;
