import { Router } from "express";
import { getPropertiesRouter } from "./getProperties";
import { modifyPropertiesRouter } from "./updateProperties";

const router = Router();

router.use(getPropertiesRouter, modifyPropertiesRouter);

export { router as propertiesRouter };
