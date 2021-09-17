/*
 * Created by Jimmy Lan
 * Creation Date: 2021-08-22
 */

/**
 * Default limits that regular users have on resources.
 * The max delete counts are valid for a period of time (i.e. the interval
 * between two scheduled worker runs), as the num delete counts will be reset
 * by the worker once scheduled check is completed.
 */
export const defaultQuota = {
  maxTransactions: 1000,
  maxDeletedTransactions: 1000,
  maxProperties: 100,
  maxDeletedProperties: 100,
};
