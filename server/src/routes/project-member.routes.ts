import { Router } from "express";
import {
  authenticateUser,
  verifyPermission,
} from "../middlewares/auth.middleware";
import {
  addMemberToProject,
  deleteMemberFromProject,
  updateMemberRole,
  getProjectMembers,
} from "../controllers/project-member.controllers";
import { UserRolesEnum } from "../constants/constants";
import { validate } from "../middlewares/validator.middleware";
import {
  addMemberToProjectValidators,
  deleteMemberFromProjectValidators,
  updateMemberRoleValidators,
} from "../validators/project-member.validators";

const router = Router();

router
  .route("/:projectId")
  .get(
    authenticateUser,
    verifyPermission([UserRolesEnum.PROJECT_ADMIN, UserRolesEnum.MEMBER]),
    getProjectMembers,
  )
  .post(
    authenticateUser,
    verifyPermission([UserRolesEnum.PROJECT_ADMIN]),
    addMemberToProjectValidators(),
    validate,
    addMemberToProject,
  )
  .patch(
    authenticateUser,
    verifyPermission([UserRolesEnum.ADMIN]),
    updateMemberRoleValidators(),
    validate,
    updateMemberRole,
  )
  .delete(
    authenticateUser,
    verifyPermission([UserRolesEnum.PROJECT_ADMIN]),
    deleteMemberFromProjectValidators(),
    validate,
    deleteMemberFromProject,
  );

export default router;
