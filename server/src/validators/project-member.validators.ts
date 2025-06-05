import { body } from "express-validator";
import { AvailableUserRoles } from "../constants/constants";

const addMemberToProjectValidators = () => {
  return [body("memberId").isMongoId().withMessage("Invalid Member ID")];
};

const updateMemberRoleValidators = () => {
  return [
    body("memberId").isMongoId().withMessage("Invalid Member ID"),
    body("role").isIn(AvailableUserRoles).withMessage("Invalid Role"),
  ];
};

const deleteMemberFromProjectValidators = () => {
  return [body("memberId").isMongoId().withMessage("Invalid Member ID")];
};

export {
  addMemberToProjectValidators,
  updateMemberRoleValidators,
  deleteMemberFromProjectValidators,
};
