import { Router } from "express";
import { googleAuth } from "../controllers/googleAuthController";

const router = Router();

router.post("/google", googleAuth);

export default router;
