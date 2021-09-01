import { Router } from "express";
import { createTransactionRouter } from "./createTransaction";
import { deleteTransactionRouter } from "./removeTransaction";
import { listTransactionsRouter } from "./listTransactions";
import { modifyTransactionRouter } from "./updateTransaction";

const router = Router();

router.use(
  createTransactionRouter,
  deleteTransactionRouter,
  listTransactionsRouter,
  modifyTransactionRouter
);

export { router as transactionsRouter };
