/**
 * @fileoverview Project creation configuration
 * @module project-creation/config
 */

import { IconCloudUpload, IconFolderPlus, IconFolderSearch, IconClipboardCheck } from '@tabler/icons-react';
import { WizardStepConfig } from '../../wizard/types';
import { ProjectFormData } from './types';
import { validateName, validateProvider, validateFolderPath } from './validation';
import { ProviderStep, NameStep, FolderStep, ReviewStep } from './steps';

/**
 * Project creation steps configuration
 * @constant {WizardStepConfig<ProjectFormData>[]}
 */
export const STEPS: WizardStepConfig<ProjectFormData>[] = [
  {
    id: 'provider',
    label: 'Cloud Provider',
    description: 'Select storage provider',
    icon: IconCloudUpload,
    fields: ['provider'],
    validation: async (data) => {
      const error = await validateProvider(data.provider);
      return !error;
    },
    render: ProviderStep
  },
  {
    id: 'name',
    label: 'Project Name',
    description: 'Enter project name',
    icon: IconFolderPlus,
    fields: ['name'],
    validation: async (data) => {
      const error = await validateName(data.name);
      return !error;
    },
    render: NameStep
  },
  {
    id: 'folder',
    label: 'Select Folder',
    description: 'Choose location',
    icon: IconFolderSearch,
    fields: ['folderPath', 'provider'],
    validation: async (data) => {
      const error = await validateFolderPath(data.folderPath);
      return !error;
    },
    render: FolderStep
  },
  {
    id: 'review',
    label: 'Review',
    description: 'Confirm details',
    icon: IconClipboardCheck,
    fields: ['name', 'provider', 'folderPath'],
    validation: async (data) => {
      // Validate all fields in sequence
      const nameError = await validateName(data.name);
      if (nameError) return false;

      const providerError = await validateProvider(data.provider);
      if (providerError) return false;

      const folderError = await validateFolderPath(data.folderPath);
      if (folderError) return false;

      return true;
    },
    render: ReviewStep
  }
] as const;