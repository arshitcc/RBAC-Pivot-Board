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

const verifyProjectPermission = (roles: UserRoles[] = []) =>
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
        userId: req.user._id,
        role: { $in: roles },
      });

      if (!projectMember) {
        throw new ApiError(403, "Unauthorized action");
      }

      next();
    },
  );

const verifyTaskPermission = (roles: UserRoles[] = []) =>
  asyncHandler(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
      if (req.user.role === UserRolesEnum.ADMIN) {
        // A global ADMIN does not need a permission, they can do everything.
        return next();
      }

      if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized request");
      }

      const { projectId, taskId } = req.params;

      if (!isValidObjectId(taskId) || !isValidObjectId(projectId)) {
        throw new ApiError(400, "Invalid Task or Project");
      }

      if (!roles.includes(req.user.role)) {
        throw new ApiError(403, "Unauthorized action");
      }

      const projectAdmin = await ProjectMember.findOne({
        projectId,
        memberId: req.user._id,
        role: { $in: roles },
      });

      if (projectAdmin) {
        return next();
      }

      if (
        req.method.trim().toLowerCase() === "delete" ||
        req.method === "patch"
      ) {
        // not a project admin
        const taskAssignedBy = await Task.findOne({
          _id: taskId,
          projectId,
          assignedBy: req.user._id,
        });

        if (!taskAssignedBy) {
          // not a task creator, then who the hell are you to delete or update
          throw new ApiError(403, "Unauthorized action");
        }

        return next();
      }

      const taskMember = await Task.findOne({
        _id: taskId,
        projectId,
        $or: [{ assignedTo: req.user._id }, { assignedBy: req.user._id }],
      });

      if (!taskMember) {
        throw new ApiError(403, "Unauthorized action");
      }

      next();
    },
  );

export { authenticateUser, verifyProjectPermission, verifyTaskPermission };
