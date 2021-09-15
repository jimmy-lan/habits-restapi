import { Router } from "express";
import { listPropertiesRouter } from "./listProperties";
import { modifyPropertiesRouter } from "./updateProperties";
import { createPropertyRouter } from "./createProperty";

const router = Router();

router.use(createPropertyRouter, listPropertiesRouter, modifyPropertiesRouter);

export { router as propertiesRouter };
