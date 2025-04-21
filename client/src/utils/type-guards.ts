import { ApiResponse } from '../types/api';
import { CloudFolder, CloudFolderListResponse } from '../types/tenant';

/**
 * Type guard for API responses
 */
export function isApiResponse<T>(
  response: unknown
): response is ApiResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    'data' in response
  );
}

/**
 * Type guard for CloudFolderListResponse
 */
export function isCloudFolderListResponse(
  data: unknown
): data is CloudFolderListResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'folders' in data &&
    Array.isArray((data as CloudFolderListResponse).folders) &&
    (data as CloudFolderListResponse).folders.every(isCloudFolder)
  );
}

/**
 * Type guard for CloudFolder
 */
export function isCloudFolder(folder: unknown): folder is CloudFolder {
  return (
    typeof folder === 'object' &&
    folder !== null &&
    'id' in folder &&
    'name' in folder &&
    'path' in folder &&
    'hasChildren' in folder &&
    typeof (folder as CloudFolder).id === 'string' &&
    typeof (folder as CloudFolder).name === 'string' &&
    typeof (folder as CloudFolder).path === 'string' &&
    typeof (folder as CloudFolder).hasChildren === 'boolean'
  );
}