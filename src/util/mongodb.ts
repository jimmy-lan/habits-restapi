/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-22
 * Description: Utils relating to Mongo DB.
 */

/**
 * A condition to be used when we query not deleted documents.
 */
export const notDeletedCondition = {
  $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
};
