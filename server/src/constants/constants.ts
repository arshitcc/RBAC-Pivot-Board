export const UserRolesEnum = {
  ADMIN: "admin",
  PROJECT_ADMIN: "project_admin",
  MEMBER: "member",
} as const;

export const PaymentProviderEnum = {
  UNKNOWN: "unknown",
  RAZORPAY: "razorpay",
  PAYPAL: "paypal",
} as const;

export const CouponTypeEnum = {
  FLAT: "flat",
  PERCENTAGE: "percentage",
} as const;

export const UserAuthType = {
  GOOGLE: "google",
  GITHUB: "github",
  CREDENTIALS: "credentials",
} as const;

export const TaskStatusEnum = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done",
} as const;

export const AvailableUserRoles = Object.values(UserRolesEnum);
export const AvailablePaymentProviders = Object.values(PaymentProviderEnum);
export const AvailableCouponTypes = Object.values(CouponTypeEnum);
export const AvailableAuthTypes = Object.values(UserAuthType);
export const AvailableTaskStatuses = Object.values(TaskStatusEnum);

export type UserRoles = (typeof AvailableUserRoles)[number];
export type TaskStatuses = (typeof AvailableTaskStatuses)[number];
