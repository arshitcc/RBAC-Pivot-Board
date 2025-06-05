import { Response } from "express";
import { CustomRequest } from "../models/user.models";
import asyncHandler from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { ITask, Task } from "../models/task.models";
import { deleteFile, uploadFile } from "../utils/cloudinary";
import mongoose from "mongoose";
import { SubTask } from "../models/subtask.models";

export const commonTaskAggregation = () => [
  {
    $lookup: {
      from: "users",
      localField: "assignedToId",
      foreignField: "_id",
      pipeline: [
        {
          $project: {
            name: 1,
            email: 1,
          },
        },
      ],
      as: "assignedTo",
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "assignedById",
      foreignField: "_id",
      pipeline: [
        {
          $project: {
            name: 1,
            email: 1,
          },
        },
      ],
      as: "assignedBy",
    },
  },
  {
    $lookup: {
      from: "subtasks",
      localField: "_id",
      foreignField: "taskId",
      pipeline: [
        {
          $project: {
            title: 1,
            isCompleted: 1,
          },
        },
      ],
      as: "subtasks",
    },
  },
];

const createTask = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { name, description, assignedToId } = req.body;
  const { projectId } = req.params;
  const files = req.files as Express.Multer.File[];

  let attachments = [];
  for (const file of files) {
    const uploadedFile = await uploadFile(file.path);
    const { public_id, url, format, resource_type } = uploadedFile;
    attachments.push({ public_id, url, format, resource_type });
  }

  const task = await Task.create({
    name,
    description,
    projectId,
    assignedToId,
    assignedById: req.user._id,
    attachments,
  });

  if (!task) {
    throw new ApiError(500, "Internal Server Error");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, true, "Task Assigned successfully", task));
});

const updateTask = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { projectId, taskId } = req.params;
  const { name, description, assignedToId, status } = req.body;

  let data: Partial<ITask> = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (assignedToId !== undefined) data.assignedToId = assignedToId;
  if (status !== undefined) data.status = status;

  const task = await Task.findOneAndUpdate(
    { _id: taskId, projectId, assignedById: req.user._id },
    { $set: data },
    { new: true },
  );

  if (!task) {
    throw new ApiError(404, "Failed to Update task");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, true, "Task Updated successfully", task));
});

const deleteTask = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { projectId, taskId } = req.params;

  const task = await Task.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(taskId),
        projectId: new mongoose.Types.ObjectId(projectId),
        assignedById: new mongoose.Types.ObjectId(req.user._id as string),
      },
    },
    ...commonTaskAggregation(),
  ]);

  const attachments = task[0].attachments;

  for (const attachment of attachments) {
    await deleteFile(attachment.public_id, attachment.resource_type);
  }
  await SubTask.deleteMany({ taskId });
  await Task.deleteOne({ _id: taskId, projectId, assignedById: req.user._id });

  return res
    .status(200)
    .json(new ApiResponse(200, true, "Task Deleted successfully"));
});

const getTasks = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { projectId } = req.params;

  const tasks = await Task.aggregate([
    {
      $match: {
        projectId: new mongoose.Types.ObjectId(projectId),
        $or: [
          { assignedToId: new mongoose.Types.ObjectId(req.user._id as string) },
          { assignedById: new mongoose.Types.ObjectId(req.user._id as string) },
        ],
      },
    },
    ...commonTaskAggregation(),
    {
      $sort: {
        updatedAt: -1,
        createdAt: -1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, true, "Tasks Fetched successfully", tasks));
});

const getTaskById = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { projectId, taskId } = req.params;

  const task = await Task.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(taskId),
        projectId: new mongoose.Types.ObjectId(projectId),
        $or: [
          { assignedToId: new mongoose.Types.ObjectId(req.user._id as string) },
          { assignedById: new mongoose.Types.ObjectId(req.user._id as string) },
        ],
      },
    },
    ...commonTaskAggregation(),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, true, "Task Fetched successfully", task));
});

export { createTask, updateTask, deleteTask, getTasks, getTaskById };
