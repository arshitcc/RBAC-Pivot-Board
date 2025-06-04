import { Router } from "express";
import {
  createSubTask,
  updateSubTask,
  deleteSubTask,
} from "../controllers/subtask.controllers";
import {
  authenticateUser,
  verifyPermission,
} from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validator.middleware";
import { UserRolesEnum } from "../constants/constants";
import {
  createSubTaskValidators,
  updateSubTaskValidators,
} from "../validators/subtask.validators";
import { mongoIdPathVariableValidator } from "../validators/common/mongodb/mongodb.validators";

const router = Router();

router
  .route("/:taskId")
  .post(
    authenticateUser,
    verifyPermission([UserRolesEnum.PROJECT_ADMIN, UserRolesEnum.MEMBER]),
    mongoIdPathVariableValidator("taskId"),
    createSubTaskValidators(),
    validate,
    createSubTask,
  );
router
  .route("/:taskId/:subtaskId")
  .patch(
    authenticateUser,
    verifyPermission([UserRolesEnum.PROJECT_ADMIN, UserRolesEnum.MEMBER]),
    mongoIdPathVariableValidator("taskId"),
    mongoIdPathVariableValidator("subtaskId"),
    updateSubTaskValidators(),
    validate,
    updateSubTask,
  )
  .delete(
    authenticateUser,
    verifyPermission([UserRolesEnum.PROJECT_ADMIN, UserRolesEnum.MEMBER]),
    mongoIdPathVariableValidator("taskId"),
    mongoIdPathVariableValidator("subtaskId"),
    deleteSubTask,
  );

export default router;
