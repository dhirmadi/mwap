/**
 * @fileoverview Project creation configuration
 * @module project-creation/config
 */

import { IconCloudUpload, IconFolderPlus, IconFolderSearch, IconClipboardCheck } from '@tabler/icons-react';
import { WizardStepConfig } from '../../wizard/types';
import { ProjectFormData } from './types';
import { validateProjectForm } from '../../../validation/projectValidation';
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
      const result = await validateProjectForm(data);
      return result.results.provider?.isValid ?? false;
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
      const result = await validateProjectForm(data);
      return result.results.name?.isValid ?? false;
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
      const result = await validateProjectForm(data);
      return result.results.folderPath?.isValid ?? false;
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
      const result = await validateProjectForm(data);
      return result.isValid;
    },
    render: ReviewStep
  }
] as const;