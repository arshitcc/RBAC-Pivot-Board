import { body } from "express-validator";
import {
  AvailableProjectStatuses,
} from "../constants/constants";

const createProjectValidators = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Project Name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Project Name must be between 2 and 100 characters"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Project Description is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Project Description must be between 2 and 100 characters"),
  ];
};

const updateProjectValidators = () => {
  return [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Project Name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Project Name must be between 2 and 100 characters"),
    body("description")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Project Description is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Project Description must be between 2 and 100 characters"),
    body("status")
      .optional()
      .isIn(AvailableProjectStatuses)
      .withMessage("Invalid Project Status"),
  ];
};

export { createProjectValidators, updateProjectValidators };
