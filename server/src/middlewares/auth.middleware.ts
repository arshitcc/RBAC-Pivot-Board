import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { CustomRequest, IUser, User } from "../models/user.models";
import asyncHandler from "../utils/async-handler";
import { ApiResponse } from "../utils/api-response";
import { ACCESS_TOKEN_SECRET } from "../utils/env";
import { ApiError } from "../utils/api-error";
import { isValidObjectId } from "mongoose";
import { UserRoles, UserRolesEnum } from "../constants/constants";
import { ProjectMember } from "../models/projectmember.models";
import { Task } from "../models/task.models";

const authenticateUser = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token.trim()) {
      return res
        .status(400)
        .json(new ApiResponse(401, false, "Unauthorized Token"));
    }

    const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET!) as {
      _id: string;
    };

    if (!decodedToken) {
      return res
        .status(400)
        .json(new ApiResponse(401, false, "Unauthorized Token"));
    }

    const user = await User.findById<IUser>(decodedToken._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry",
    );

    if (!user) {
      return res
        .status(400)
        .json(new ApiResponse(404, false, "User not found"));
    }

    req.user = user;
    next();
  },
);

const verifyPermission = (roles: UserRoles[] = []) =>
  asyncHandler(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
      if (req.user.role === UserRolesEnum.ADMIN) {
        // A global ADMIN does not need a permission, they can do everything.
        return next();
      }

      if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized request");
      }

      const { projectId } = req.params;

      if (!isValidObjectId(projectId)) {
        throw new ApiError(400, "Invalid Project");
      }

      if (!roles.includes(req.user.role)) {
        throw new ApiError(403, "Unauthorized action");
      }

      const projectMember = await ProjectMember.findOne({
        projectId,
        memberId: req.user._id,
        role: { $in: roles },
      });

      if (!projectMember) {
        throw new ApiError(403, "Unauthorized action");
      }

      next();
    },
  );

export { authenticateUser, verifyPermission };
