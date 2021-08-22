import { Router } from "express";
import { createTransactionRouter } from "./createTransaction";

const router = Router();

router.use(createTransactionRouter);

export { router as transactionsRouter };
