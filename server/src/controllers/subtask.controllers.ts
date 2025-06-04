import { Response } from "express";
import { CustomRequest } from "../models/user.models";
import asyncHandler from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { SubTask } from "../models/subtask.models";

const createSubTask = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { title } = req.body;
    const { taskId } = req.params;

    const subTask = await SubTask.create({
      title,
      taskId,
      createdBy: req.user._id,
    });

    if (!subTask) {
      throw new ApiError(500, "Internal Server Error");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, true, "Subtask created successfully", subTask),
      );
  },
);

const updateSubTask = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    
    const { taskId, subtaskId } = req.params;
    const { title, isCompleted } = req.body;

    let data = {};
    [title, isCompleted].forEach((value) => {
      if (value) {
        data = { ...data, [value]: value };
      }
    });

    const subTask = await SubTask.findOneAndUpdate(
      { _id: subtaskId, taskId },
      { $set: data },
      { new: true },
    );

    if (!subTask) {
      throw new ApiError(404, "Failed to Update subtask");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, true, "Subtask Updated successfully", subTask),
      );
  },
);

const deleteSubTask = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { taskId, subtaskId } = req.params;
    await SubTask.findOneAndDelete({ _id: subtaskId, taskId });

    return res
      .status(200)
      .json(new ApiResponse(200, true, "Subtask deleted successfully"));
  },
);

export { createSubTask, updateSubTask, deleteSubTask };
