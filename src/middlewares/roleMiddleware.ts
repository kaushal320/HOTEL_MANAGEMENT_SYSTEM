import { Request, Response, NextFunction } from "express";

export const allowRoles = (
  ...roles: ("admin" | "receptionist" | "customer")[]
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore: assuming req.user is set by `protect` middleware
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({
        message: "Unauthorized: User role not found",
        allowedRoles: roles,
      });
    }

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        message: `Access denied: Role '${userRole}' is not allowed`,
        allowedRoles: roles,
      });
    }

    next();
  };
};
