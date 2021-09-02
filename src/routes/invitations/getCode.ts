import { Request, Response, Router } from "express";
import { requireAuth } from "../../middlewares";
import { User, UserDocument } from "../../models";
import { UnauthorizedError } from "../../errors";
import { ResBody } from "../../types";

const router = Router();

router.get(
  "/code",
  requireAuth,
  async (req: Request, res: Response<ResBody>) => {
    const { id } = req.user!;

    const user: UserDocument | null = await User.findById(id).populate(
      "invitation.details"
    );
    if (!user) {
      throw new UnauthorizedError();
    }

    return res.json({
      success: true,
      payload: {
        code: user.invitation?.details.code,
      },
    });
  }
);

export { router as getCodeRouter };
