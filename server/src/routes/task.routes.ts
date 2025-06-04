import { Router } from "express";
import { upload } from "../middlewares/multer.middleware";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
} from "../controllers/task.controllers";
import { validate } from "../middlewares/validator.middleware";
import {
  createTaskValidators,
  updateTaskValidators,
} from "../validators/task.validators";
import {
  authenticateUser,
  verifyPermission,
} from "../middlewares/auth.middleware";
import { UserRolesEnum } from "../constants/constants";
import { mongoIdPathVariableValidator } from "../validators/common/mongodb/mongodb.validators";

const router = Router();

router
  .route("/:projectId")
  .post(
    authenticateUser,
    verifyPermission([UserRolesEnum.PROJECT_ADMIN]),
    upload.array("attachments", 5),
    createTaskValidators(),
    validate,
    createTask,
  )
  .get(
    authenticateUser,
    verifyPermission([UserRolesEnum.PROJECT_ADMIN]),
    getTasks,
  );

router
  .route("/:projectId/:taskId")
  .get(
    authenticateUser,
    verifyPermission([UserRolesEnum.PROJECT_ADMIN]),
    mongoIdPathVariableValidator("taskId"),
    getTaskById,
  )
  .patch(
    authenticateUser,
    verifyPermission([UserRolesEnum.PROJECT_ADMIN]),
    mongoIdPathVariableValidator("taskId"),
    updateTaskValidators(),
    validate,
    updateTask,
  )
  .delete(
    authenticateUser,
    verifyPermission([UserRolesEnum.PROJECT_ADMIN]),
    mongoIdPathVariableValidator("taskId"),
    deleteTask,
  );

export default router;
