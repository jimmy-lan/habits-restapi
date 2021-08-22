import { Router } from "express";
import { createTransactionRouter } from "./createTransaction";
import { deleteTransactionRouter } from "./deleteTransaction";
import { listTransactionsRouter } from "./listTransactions";

const router = Router();

router.use(
  createTransactionRouter,
  deleteTransactionRouter,
  listTransactionsRouter
);

export { router as transactionsRouter };
