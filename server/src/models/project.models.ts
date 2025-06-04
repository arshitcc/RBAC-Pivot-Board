import mongoose from "mongoose";

export interface IProject extends mongoose.Document {
  name: string;
  description: string;
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export const Project = mongoose.model<IProject>("Project", projectSchema);
