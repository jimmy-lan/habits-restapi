import { Router } from "express";
import { createInvitationRouter } from "./createInvitation";

const router = Router();

router.use(createInvitationRouter);

export { router as invitationsRouter };
