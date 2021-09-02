import { UserRole } from "../types";
import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../errors";
import { requireAuth } from "./requireAuth";

export const requireRoles = (roles: UserRole[]) => {
  return [
    requireAuth,
    (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || !roles.includes(req.user?.role)) {
        // This is intended. Inspired by GitHub, I don't want to give the
        // client too much information on this.
        console.log(
          `User "${req.user?.id}" does not have permission to access this resource.`
        );
        throw new NotFoundError();
      }
      next();
    },
  ];
};
