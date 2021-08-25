import { Router } from "express";
import { getPropertiesRouter } from "./getProperties";
import { modifyPropertiesRouter } from "./modifyProperties";

const router = Router();

router.use(getPropertiesRouter, modifyPropertiesRouter);

export { router as propertiesRouter };
