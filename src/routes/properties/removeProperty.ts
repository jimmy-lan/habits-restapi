import { Request, Response, Router } from "express";
import { param } from "express-validator";
import { validateRequest } from "../../middlewares";

const router = Router();

router.delete(
  "/:propertyId",
  [param("propertyId").notEmpty().isMongoId()],
  validateRequest,
  async (req: Request, res: Response) => {}
);

export { router as deletePropertyRouter };
