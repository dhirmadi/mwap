/**
 * @fileoverview Project creation configuration
 * @module project-creation/config
 */

import { IconCloudUpload, IconFolderPlus, IconFolderSearch, IconClipboardCheck } from '@tabler/icons-react';
import { WizardStepConfig } from '../../wizard/types';
import { ProjectFormData } from './types';
import { PROJECT_RULES } from '../../../validation/projectValidation';
import { ProviderStep, NameStep, FolderStep, ReviewStep } from './steps';

/**
 * Project creation steps configuration
 * @constant {WizardStepConfig<ProjectFormData>[]}
 */
export const STEPS: WizardStepConfig<ProjectFormData>[] = [
  {
    id: 'provider',
    label: 'Cloud Provider',
    description: PROJECT_RULES.provider.description,
    icon: IconCloudUpload,
    fields: ['provider'],
    render: ProviderStep
  },
  {
    id: 'name',
    label: 'Project Name',
    description: PROJECT_RULES.name.description,
    icon: IconFolderPlus,
    fields: ['name'],
    render: NameStep
  },
  {
    id: 'folder',
    label: 'Select Folder',
    description: PROJECT_RULES.folderPath.description,
    icon: IconFolderSearch,
    fields: ['folderPath', 'provider'],
    render: FolderStep
  },
  {
    id: 'review',
    label: 'Review',
    description: 'Confirm project details',
    icon: IconClipboardCheck,
    fields: ['name', 'provider', 'folderPath'],
    render: ReviewStep
  }
] as const;