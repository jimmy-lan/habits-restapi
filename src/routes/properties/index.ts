import { Router } from "express";
import { listPropertiesRouter } from "./listProperties";
import { modifyPropertiesRouter } from "./updateProperties";

const router = Router();

router.use(listPropertiesRouter, modifyPropertiesRouter);

export { router as propertiesRouter };
