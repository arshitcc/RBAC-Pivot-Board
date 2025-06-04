import mongoose from "mongoose";

export interface IProjectNote extends mongoose.Document {
  projectId: mongoose.Types.ObjectId;
  createdById: mongoose.Types.ObjectId;
  content: string;
}

const projectNoteSchema = new mongoose.Schema<IProjectNote>(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
      required: true,
    },
  },
  { timestamps: true },
);

export const ProjectNote = mongoose.model<IProjectNote>(
  "ProjectNote",
  projectNoteSchema,
);
