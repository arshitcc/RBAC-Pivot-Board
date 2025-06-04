import { Router } from "express";
import {
  createNote,
  updateNote,
  deleteNote,
  getNotes,
  getNoteById,
} from "../controllers/project-note.controllers";
import {
  authenticateUser,
  verifyPermission,
} from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validator.middleware";
import { UserRolesEnum } from "../constants/constants";
import { createProjectNoteValidators, updateProjectNoteValidators } from "../validators/project-note.validators";
import { mongoIdPathVariableValidator } from "../validators/common/mongodb/mongodb.validators";

const router = Router();

router
  .route("/:projectId")
  .get(
    authenticateUser,
    verifyPermission([UserRolesEnum.PROJECT_ADMIN, UserRolesEnum.MEMBER]),
    getNotes,
  )
  .post(
    authenticateUser,
    verifyPermission([UserRolesEnum.PROJECT_ADMIN]),
    createProjectNoteValidators(),
    validate,
    createNote,
  );

router
  .route("/:projectId/:noteId")
  .get(
    authenticateUser,
    verifyPermission([UserRolesEnum.PROJECT_ADMIN]),
    mongoIdPathVariableValidator("noteId"),
    getNoteById,
  )
  .patch(
    authenticateUser,
    verifyPermission([UserRolesEnum.PROJECT_ADMIN]),
    mongoIdPathVariableValidator("noteId"),
    updateProjectNoteValidators(),
    validate,
    updateNote,
  )
  .delete(
    authenticateUser,
    verifyPermission([UserRolesEnum.PROJECT_ADMIN]),
    mongoIdPathVariableValidator("noteId"),
    deleteNote,
  );

export default router;
