import { Request, Response, Router } from "express";
import { param } from "express-validator";
import { validateRequest } from "../../middlewares";
import mongoose from "mongoose";

const router = Router();

router.delete(
  "/:propertyId",
  [param("propertyId").notEmpty().isMongoId()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { propertyId } = req.params;
    const user = req.user!;

    // We need to remove the property together with all transactions
    // for this property.
    const session = await mongoose.startSession();

    session.endSession();
  }
);

export { router as deletePropertyRouter };
