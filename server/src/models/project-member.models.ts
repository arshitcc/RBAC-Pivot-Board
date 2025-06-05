import mongoose from "mongoose";
import {
  AvailableUserRoles,
  UserRoles,
  UserRolesEnum,
} from "../constants/constants";

export interface IProjectMember {
  projectId: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;
  role: UserRoles;
}

const projectMemberSchema = new mongoose.Schema<IProjectMember>(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: AvailableUserRoles,
      default: UserRolesEnum.MEMBER,
    },
  },
  { timestamps: true },
);

export const ProjectMember = mongoose.model<IProjectMember>(
  "ProjectMember",
  projectMemberSchema,
);
