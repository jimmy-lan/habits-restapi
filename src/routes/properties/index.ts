import { Router } from "express";
import { listPropertiesRouter } from "./listProperties";
import { modifyPropertiesRouter } from "./updateProperty";
import { createPropertyRouter } from "./createProperty";
import { deletePropertyRouter } from "./removeProperty";

const router = Router();

router.use(
  createPropertyRouter,
  deletePropertyRouter,
  listPropertiesRouter,
  modifyPropertiesRouter
);

export { router as propertiesRouter };
