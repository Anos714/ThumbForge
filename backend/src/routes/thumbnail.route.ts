import { Router } from "express";

const router = Router();

router.post("/create");
router.get("/get");
router.get("/get/:id");
router.patch("/update/:id");
router.delete("/delete/:id");

export default router
