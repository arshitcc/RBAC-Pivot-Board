import { Response } from "express";
import { CustomRequest } from "../models/user.models";
import asyncHandler from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { UserRolesEnum } from "../constants/constants";
import { IProject, Project } from "../models/project.models";
import { ProjectMember } from "../models/project-member.models";
import mongoose from "mongoose";
import { commonTaskAggregation } from "./task.controllers";
import { deleteFile } from "../utils/cloudinary";
import { SubTask } from "../models/subtask.models";
import { Task } from "../models/task.models";
import { ProjectNote } from "../models/project-note.models";

export const commonProjectAggregation = () => {
  return [
    {
      $lookup: {
        from: "project_members",
        localField: "_id",
        foreignField: "projectId",
        pipeline: [
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
        ],
        as: "members",
      },
    },
    {
      $lookup: {
        from: "project_notes",
        localField: "_id",
        foreignField: "projectId",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdById",
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
              as: "createdBy",
            },
          },
        ],
        as: "notes",
      },
    },
  ];
};

const createProject = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      createdById: req.user._id,
    });

    if (!project) {
      throw new ApiError(500, "Internal Server");
    }

    // as user has created project means he is project_admin of that project
    const addUserAsMember = await ProjectMember.create({
      projectId: project._id,
      memberId: req.user._id,
      role: UserRolesEnum.PROJECT_ADMIN,
    });

    if (!addUserAsMember) {
      throw new ApiError(500, "Internal Server");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, true, "Project created successfully", project),
      );
  },
);

const updateProject = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { projectId } = req.params;
    const { name, description, status } = req.body;

    let data: Partial<IProject> = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = status;

    const project = await Project.findOneAndUpdate(
      { _id: projectId },
      { $set: data },
      { new: true },
    );

    if (!project) {
      throw new ApiError(404, "Project does not exist");
    }
  },
);

const deleteProject = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    // auth_admin -> delete sub-tasks -> delete tasks ->delete notes ->  delete members -> delete project,
    const { projectId } = req.params;

    const project = await Project.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(projectId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdById",
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
          as: "createdBy",
        },
      },
      ...commonProjectAggregation(),
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "projectId",
          pipeline: [
            ...commonTaskAggregation(),
            {
              $sort: {
                updatedAt: -1,
                createdAt: -1,
              },
            },
          ],
          as: "tasks",
        },
      },
    ]);

    const { tasks } = project[0];

    for (const task of tasks) {
      const attachments = task.attachments;
      for (const attachment of attachments) {
        await deleteFile(attachment.public_id, attachment.resource_type);
      }
      await SubTask.deleteMany({ taskId: task._id });
    }
    await Task.deleteMany({ projectId });
    await ProjectNote.deleteMany({ projectId });
    await ProjectMember.deleteMany({ projectId });
    await Project.deleteOne({ _id: projectId });

    return res
      .status(200)
      .json(new ApiResponse(200, true, "Project Deleted successfully"));
  },
);

const getProjects = asyncHandler(async (req: CustomRequest, res: Response) => {
  const projects = await ProjectMember.aggregate([
    {
      $match: {
        memberId: new mongoose.Types.ObjectId(req.user._id as string),
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "projectId",
        foreignField: "_id",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdById",
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
              as: "createdBy",
            },
          },
          ...commonProjectAggregation(),
          {
            $lookup: {
              from: "tasks",
              localField: "_id",
              foreignField: "projectId",
              pipeline: [
                ...commonTaskAggregation(),
                {
                  $sort: {
                    updatedAt: -1,
                    createdAt: -1,
                  },
                },
              ],
              as: "tasks",
            },
          },
        ],
        as: "projects",
      },
    },
  ]);

  if (!projects) {
    throw new ApiError(500, "Internal Server Error");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, true, "Projects Fetched Successfully", projects),
    );
});

const getProjectById = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { projectId } = req.params;

    const project = await Project.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(projectId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdById",
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
          as: "createdBy",
        },
      },
      ...commonProjectAggregation(),
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "projectId",
          pipeline: [
            ...commonTaskAggregation(),
            {
              $sort: {
                updatedAt: -1,
                createdAt: -1,
              },
            },
          ],
          as: "tasks",
        },
      },
    ]);

    if (!project) {
      throw new ApiError(500, "Internal Server Error");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, true, "Project Fetched successfully", project),
      );
  },
);

export {
  createProject,
  updateProject,
  deleteProject,
  getProjects,
  getProjectById,
};
