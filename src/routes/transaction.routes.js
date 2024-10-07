import { Router } from "express";
import { initDB, listTransactions } from "../controllers/transaction.controller.js";

const router = Router();

router.route("/initDatabase").get(initDB);
router.route("/").get(listTransactions);

export default router;