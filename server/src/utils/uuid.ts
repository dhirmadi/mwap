import { randomUUID, validate as uuidValidate } from 'uuid';

export const generateUUID = (): string => randomUUID();

export const isValidUUID = (uuid: string): boolean => {
  try {
    return uuidValidate(uuid);
  } catch {
    return false;
  }
};