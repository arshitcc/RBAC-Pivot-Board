import mongoose from "mongoose";
import {
  AvailableTaskStatuses,
  TaskStatusEnum,
  TaskStatuses,
} from "../constants/constants";
import { File } from "./user.models";

export interface ITask extends mongoose.Document {
  name: string;
  description: string;
  projectId: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  status: TaskStatuses;
  attachments: File[];
}

const taskSchema = new mongoose.Schema<ITask>(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: AvailableTaskStatuses,
      default: TaskStatusEnum.TODO,
      required: true,
    },
    attachments: [
      {
        url: String,
        format: String,
        resource_type: String,
        public_id: String,
      },
    ],
  },
  { timestamps: true },
);

export const Task = mongoose.model<ITask>("Task", taskSchema);
