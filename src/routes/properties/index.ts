import { Router } from "express";
import { getPropertiesRouter } from "./getProperties";

const router = Router();

router.use(getPropertiesRouter);

export { router as propertiesRouter };
