import mongoose from "mongoose";

export interface ISubTask extends mongoose.Document {
  title: string;
  taskId: mongoose.Types.ObjectId;
  isCompleted: boolean;
  createdBy: mongoose.Types.ObjectId;
}

const subTaskSchema = new mongoose.Schema<ISubTask>(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export const SubTask = mongoose.model("SubTask", subTaskSchema);
