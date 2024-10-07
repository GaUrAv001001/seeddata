import { Router } from "express";
import { initDB, listTransactions, getStatistics, getDataForBarChart } from "../controllers/transaction.controller.js";

const router = Router();

router.route("/initDatabase").get(initDB);
router.route("/").get(listTransactions);
router.route("/statistics").get(getStatistics);
router.route("/barchartdata").get(getDataForBarChart);

export default router;