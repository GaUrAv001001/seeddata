import { Router } from "express";
import { initDB } from "../controllers/transaction.controller.js";

const router = Router();

router.route("/initDatabase").get(initDB);

export default router;