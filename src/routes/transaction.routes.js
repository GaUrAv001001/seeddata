import { Router } from "express";
import { initDB, listTransactions, getStatistics, getDataForBarChart, getPieChartData, combinedResponse } from "../controllers/transaction.controller.js";

const router = Router();

router.route("/initDatabase").get(initDB);
router.route("/").get(listTransactions);
router.route("/statistics").get(getStatistics);
router.route("/barchartdata").get(getDataForBarChart);
router.route("/pieChartdata").get(getPieChartData);
router.route("/combined-data").get(combinedResponse);

export default router;