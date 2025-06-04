import { body } from "express-validator";
import { AvailableTaskStatuses } from "../constants/constants";

const createTaskValidators = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Task Name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Task Name must be between 2 and 100 characters"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Task Description is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Task Description must be between 2 and 100 characters"),
  ];
};

const updateTaskValidators = () => {
  return [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Task Name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Task Name must be between 2 and 100 characters"),
    body("description")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Task Description is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Task Description must be between 2 and 100 characters"),
    body("assignedTo")
      .optional()
      .isMongoId()
      .withMessage("Invalid Assignee ID"),
    body("status")
      .optional()
      .isIn(AvailableTaskStatuses)
      .withMessage("Invalid Task Status"),
  ];
};

export { createTaskValidators, updateTaskValidators };
