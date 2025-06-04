import { body } from "express-validator";

const createSubTaskValidators = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Subtask Title is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Subtask Title must be between 2 and 100 characters"),
  ];
};

const updateSubTaskValidators = () => {
  return [
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Subtask Title is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Subtask Title must be between 2 and 100 characters"),
    body("isCompleted")
      .optional()
      .isBoolean()
      .withMessage("isCompleted must be a boolean"),
  ];
};

export { createSubTaskValidators, updateSubTaskValidators };
