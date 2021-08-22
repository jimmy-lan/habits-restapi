import { Router } from "express";
import { createTransactionRouter } from "./createTransaction";
import { deleteTransactionRouter } from "./deleteTransaction";

const router = Router();

router.use(createTransactionRouter, deleteTransactionRouter);

export { router as transactionsRouter };
