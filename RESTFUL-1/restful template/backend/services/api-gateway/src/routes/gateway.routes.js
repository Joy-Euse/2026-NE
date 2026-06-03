import express from "express";
import { getApiIndex, getHealth, getRoot } from "../controllers/gateway.controller.js";

const router = express.Router();

router.get("/", getRoot);
router.get("/health", getHealth);
router.get("/api", getApiIndex);

export default router;
