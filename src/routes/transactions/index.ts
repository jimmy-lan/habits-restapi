import { Router } from "express";
import { createTransactionRouter } from "./createTransaction";
import { deleteTransactionRouter } from "./deleteTransaction";
import { listTransactionsRouter } from "./listTransactions";
import { modifyTransactionRouter } from "./modifyTransaction";

const router = Router();

router.use(
  createTransactionRouter,
  deleteTransactionRouter,
  listTransactionsRouter,
  modifyTransactionRouter
);

export { router as transactionsRouter };
