import { Router, type IRouter } from "express";
import healthRouter from "./health";
import placementRouter from "./placement";

const router: IRouter = Router();

router.use(healthRouter);
router.use(placementRouter);

export default router;
