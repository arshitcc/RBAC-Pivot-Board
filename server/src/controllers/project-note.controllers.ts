import { Response } from "express";
import { CustomRequest } from "../models/user.models";
import asyncHandler from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { IProjectNote, ProjectNote } from "../models/project-note.models";
import mongoose from "mongoose";

const createNote = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { content } = req.body;
  const { projectId } = req.params;

  const projectNote = await ProjectNote.create({
    content,
    projectId,
    createdById: req.user._id,
  });

  if (!projectNote) {
    throw new ApiError(500, "Internal Server Error");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        201,
        true,
        "Note added to project Successfully",
        projectNote,
      ),
    );
});

const updateNote = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { projectId, noteId } = req.params;
  const { content } = req.body;

  let data: Partial<IProjectNote> = {};
  if (content) data.content = content;

  const updatedProjectNote = await ProjectNote.findOneAndUpdate(
    { _id: noteId, projectId },
    { $set: data },
    { new: true },
  );

  if (!updatedProjectNote) {
    throw new ApiError(500, "Internal Server Error");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        true,
        "Note upated in project Successfully",
        updatedProjectNote,
      ),
    );
});

const deleteNote = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { projectId, noteId } = req.params;

  const isDeleteNote = await ProjectNote.findOneAndDelete({
    _id: noteId,
    projectId,
  });

  if (!isDeleteNote) {
    throw new ApiError(500, "Internal Server Error");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, true, "Note deleted from project Successfully"));
});

const getNotes = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { projectId } = req.params;

  const notes = await ProjectNote.aggregate([
    {
      $match: {
        projectId: new mongoose.Types.ObjectId(projectId),
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
            },
          },
        ],
        as: "createdBy",
      },
    },
  ]);

  if (!notes) {
    throw new ApiError(500, "Internal Server Error");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, true, "Notes Fetched Successfully", notes));
});

const getNoteById = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { projectId, noteId } = req.params;

  const note = await ProjectNote.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(noteId),
        projectId: new mongoose.Types.ObjectId(projectId),
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
            },
          },
        ],
        as: "createdBy",
      },
    },
  ]);

  if (!note) {
    throw new ApiError(500, "Internal Server Error");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, true, "Note Fetched Successfully", note));
});

export { createNote, updateNote, deleteNote, getNotes, getNoteById };
