export enum DEVICE_ERRORS {
  NotAllowedError = 'NotAllowedError',
  PermissionDeniedError = 'PermissionDeniedError',
  NotReadableError = 'NotReadableError',
  TrackStartError = 'TrackStartError',
  NotFoundError = 'NotFoundError',
  DevicesNotFoundError = 'DevicesNotFoundError',
  Unknown = 'Unknown',
};

export const DEVICE_ERRORS_DENIED = [
  DEVICE_ERRORS.NotAllowedError,
  DEVICE_ERRORS.PermissionDeniedError,
];
export const DEVICE_ERRORS_BUSY = [
  DEVICE_ERRORS.NotReadableError,
  DEVICE_ERRORS.TrackStartError,
];
export const DEVICE_ERRORS_NOT_CONNECTED = [
  DEVICE_ERRORS.NotFoundError,
  DEVICE_ERRORS.DevicesNotFoundError,
];
