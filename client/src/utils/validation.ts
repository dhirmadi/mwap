
import { CloudFolder, CloudFolderListResponse } from '../types/tenant';
import { isApiResponse, isCloudFolderListResponse } from './type-guards';

/**
 * Validates and extracts folders from API response
 */
export function validateFolderResponse(
  response: unknown
): CloudFolder[] {
  if (!isApiResponse<CloudFolderListResponse>(response)) {
    throw new Error('Invalid response format: not an API response');
  }

  if (!isCloudFolderListResponse(response.data)) {
    throw new Error('Invalid response format: invalid folder list structure');
  }

  return response.data.folders;
}