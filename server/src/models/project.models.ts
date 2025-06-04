import mongoose from "mongoose";
import { AvailableProjectStatuses, ProjectStatuses, ProjectStausEnum } from "../constants/constants";

export interface IProject extends mongoose.Document {
  name: string;
  description: string;
  status : ProjectStatuses;
  createdBy: mongoose.Types.ObjectId;
}

const projectSchema = new mongoose.Schema<IProject>(
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
    status :{
      type : String,
      enum : AvailableProjectStatuses,
      default : ProjectStausEnum.ACTIVE
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export const Project = mongoose.model<IProject>("Project", projectSchema);
