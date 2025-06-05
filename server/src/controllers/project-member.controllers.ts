import { Response } from "express";
import { CustomRequest } from "../models/user.models";
import asyncHandler from "../utils/async-handler";
import { ProjectMember } from "../models/project-member.models";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import mongoose from "mongoose";

const addMemberToProject = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { memberId } = req.body;
    const { projectId } = req.params;
    const membership = await ProjectMember.create({
      projectId,
      memberId,
    });

    if (!membership) {
      throw new ApiError(500, "Internal Server Error");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          true,
          "Member added to Project Successfully",
          membership,
        ),
      );
  },
);

const deleteMemberFromProject = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { projectId } = req.params;
    const { memberId } = req.body;
    const isMemberRemoved = await ProjectMember.findOneAndDelete({
      projectId,
      memberId,
    });

    if (!isMemberRemoved) {
      throw new ApiError(500, "Internal Server Error");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, true, "Member removed from Project Successfully"),
      );
  },
);

const updateMemberRole = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { projectId } = req.params;
    const { memberId, role } = req.body;

    const updatedMember = await ProjectMember.findOneAndUpdate(
      { projectId, memberId },
      { $set: { role } },
      { new: true },
    );

    if (!updatedMember) {
      throw new ApiError(500, "Internal Server Error");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          true,
          "Member Role Updated Successfully",
          updatedMember,
        ),
      );
  },
);

const getProjectMembers = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { projectId } = req.params;

    const members = await ProjectMember.aggregate([
      {
        $match: {
          projectId: new mongoose.Types.ObjectId(projectId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "memberId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1,
                email: 1,
                avatar: 1,
              },
            },
          ],
          as: "member",
        },
      },
    ]);

    if (!members) {
      throw new ApiError(500, "Internal Server Error");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          true,
          "Project Members Fetched Successfully",
          members,
        ),
      );
  },
);

export {
  addMemberToProject,
  deleteMemberFromProject,
  updateMemberRole,
  getProjectMembers,
};
