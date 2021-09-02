import { Router } from "express";
import { createInvitationRouter } from "./createInvitation";
import { activateInvitationRouter } from "./activateInvitation";

const router = Router();

router.use(createInvitationRouter, activateInvitationRouter);

export { router as invitationsRouter };
