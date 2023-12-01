export enum ParticipantRole {
  HOST = "HOST",
  OBSERVER = "OBSERVER",
  PARTICIPANT = "PARTICIPANT",
  ANONYMOUSE = "ANONYMOUSE", // chưa thêm permission
}

// export enum ParticipantRespondJoinStatus {
//   ACCEPTED = "ACCEPTED",
//   REJECTED = "REJECTED",
// }

export enum PermissionAction {
  KICK,
  CHANGE_PERMISSIONS,
}

export function checkPermissio(
  action: PermissionAction,
  role: ParticipantRole,
  targetRole: ParticipantRole,
): boolean {
  return permissionForm[role][targetRole][action];
}

const permissionForm = {
  [ParticipantRole.HOST]: {
    [PermissionAction.KICK]: {
      [ParticipantRole.HOST]: false,
      [ParticipantRole.OBSERVER]: true,
      [ParticipantRole.PARTICIPANT]: true,
    },
    [PermissionAction.CHANGE_PERMISSIONS]: {
      [ParticipantRole.HOST]: false,
      [ParticipantRole.OBSERVER]: true,
      [ParticipantRole.PARTICIPANT]: true,
    },
  },
  [ParticipantRole.OBSERVER]: {
    [PermissionAction.KICK]: {
      [ParticipantRole.HOST]: false,
      [ParticipantRole.OBSERVER]: false,
      [ParticipantRole.PARTICIPANT]: false,
    },
    [PermissionAction.CHANGE_PERMISSIONS]: {
      [ParticipantRole.HOST]: false,
      [ParticipantRole.OBSERVER]: false,
      [ParticipantRole.PARTICIPANT]: false,
    },
  },
  [ParticipantRole.PARTICIPANT]: {
    [PermissionAction.KICK]: {
      [ParticipantRole.HOST]: false,
      [ParticipantRole.OBSERVER]: false,
      [ParticipantRole.PARTICIPANT]: false,
    },
    [PermissionAction.CHANGE_PERMISSIONS]: {
      [ParticipantRole.HOST]: false,
      [ParticipantRole.OBSERVER]: false,
      [ParticipantRole.PARTICIPANT]: false,
    },
  },
};
