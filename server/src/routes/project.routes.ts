import { Router } from "express";
import {
  createProject,
  updateProject,
  deleteProject,
  getProjects,
  getProjectById,
} from "../controllers/project.controllers";
import {
  authenticateUser,
  verifyPermission,
} from "../middlewares/auth.middleware";
import {
  createProjectValidators,
  updateProjectValidators,
} from "../validators/project.validators";
import { validate } from "../middlewares/validator.middleware";
import { UserRolesEnum } from "../constants/constants";

const router = Router();

router
  .route("/")
  .get(authenticateUser, getProjects)
  .post(
    authenticateUser,
    verifyPermission([UserRolesEnum.PROJECT_ADMIN]),
    createProjectValidators(),
    validate,
    createProject,
  );

router
  .route("/:projectId")
  .get(
    authenticateUser,
    verifyPermission([UserRolesEnum.PROJECT_ADMIN, UserRolesEnum.MEMBER]),
    getProjectById,
  )
  .patch(
    authenticateUser,
    verifyPermission([UserRolesEnum.PROJECT_ADMIN]),
    updateProjectValidators(),
    validate,
    updateProject,
  )
  .delete(
    authenticateUser,
    verifyPermission([UserRolesEnum.PROJECT_ADMIN]),
    deleteProject,
  );

export default router;
