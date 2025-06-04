import mongoose from "mongoose";
import { AvailableUserRoles, UserRoles, UserRolesEnum } from "../constants/constants";

export interface IProjectMember {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: UserRoles;
}

const projectMemberSchema = new mongoose.Schema<IProjectMember>(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: AvailableUserRoles,
      default: UserRolesEnum.MEMBER,
      required: true,
    },
  },
  { timestamps: true },
);

export const ProjectMember = mongoose.model<IProjectMember>(
  "ProjectMember",
  projectMemberSchema,
);
