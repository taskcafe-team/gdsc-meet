import { HttpJwtAuthGuard } from "@application/api/http-rest/auth/guard/HttpJwtAuthGuard";
import { HttpUserRoleAuthGuard } from "@application/api/http-rest/auth/guard/HttpUserRoleAuthGuard";
import { UserRole } from "@core/common/enums/UserEnums";
import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";

type HttpUserAuthPermission = {
  required?: boolean; //Default: true
  roles?: UserRole[]; //Default: []
};
export const HttpUserAuth = (
  permission?: HttpUserAuthPermission,
): ((...args: any) => void) => {
  if (!permission)
    return applyDecorators(
      SetMetadata("roles", null),
      UseGuards(HttpJwtAuthGuard, HttpUserRoleAuthGuard),
    );
  else {
    const { required, roles } = permission;
    const isRequired = required === undefined ? true : required;
    if (!isRequired) return applyDecorators();
    const rolesMeta = roles === undefined ? [] : roles;
    return applyDecorators(
      SetMetadata("roles", rolesMeta),
      UseGuards(HttpJwtAuthGuard, HttpUserRoleAuthGuard),
    );
  }
};
