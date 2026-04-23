import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactsRouter from "./contacts";
import companiesRouter from "./companies";
import dealsRouter from "./deals";
import activitiesRouter from "./activities";
import signalsRouter from "./signals";
import segmentsRouter from "./segments";
import callsRouter from "./calls";
import scriptsRouter from "./scripts";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";
import analyticsRouter from "./analytics";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/contacts", contactsRouter);
router.use("/companies", companiesRouter);
router.use("/deals", dealsRouter);
router.use("/activities", activitiesRouter);
router.use("/signals", signalsRouter);
router.use("/segments", segmentsRouter);
router.use("/calls", callsRouter);
router.use("/scripts", scriptsRouter);
router.use("/notifications", notificationsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/analytics", analyticsRouter);
router.use("/ai", aiRouter);

export default router;
