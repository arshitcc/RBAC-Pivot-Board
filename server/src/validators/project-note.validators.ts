import { body } from "express-validator";

const createProjectNoteValidators = () => {
  return [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Note is required")
      .isLength({ min: 10, max: 1000 }),
  ];
};

const updateProjectNoteValidators = () => {
  return [
    body("content")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Note is required")
      .isLength({ min: 10, max: 1000 }),
  ];
};

export { createProjectNoteValidators, updateProjectNoteValidators };
