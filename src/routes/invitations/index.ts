import { Router } from "express";
import { createInvitationRouter } from "./createInvitation";
import { activateInvitationRouter } from "./activateInvitation";
import { getCodeRouter } from "./getCode";

const router = Router();

router.use(createInvitationRouter, activateInvitationRouter, getCodeRouter);

export { router as invitationsRouter };
