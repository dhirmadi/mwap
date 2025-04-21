import { IconCloudUpload, IconFolderPlus, IconFolderSearch, IconClipboardCheck } from '@tabler/icons-react';
import { IntegrationProvider } from '../../../types';

export interface StepConfig {
  label: string;
  description: string;
  icon: typeof IconCloudUpload;
  field: keyof FormValues;
}

export interface FormValues {
  name: string;
  cloudProvider: IntegrationProvider;
  folderPath: string;
}

export const STEPS: StepConfig[] = [
  {
    label: 'Cloud Provider',
    description: 'Select storage provider',
    icon: IconCloudUpload,
    field: 'cloudProvider'
  },
  {
    label: 'Project Name',
    description: 'Enter project name',
    icon: IconFolderPlus,
    field: 'name'
  },
  {
    label: 'Select Folder',
    description: 'Choose location',
    icon: IconFolderSearch,
    field: 'folderPath'
  },
  {
    label: 'Review',
    description: 'Confirm details',
    icon: IconClipboardCheck,
    field: 'name' // Review step validates all fields
  }
];

export const VALIDATION_RULES = {
  name: {
    required: 'Name is required',
    min: { value: 3, message: 'Name must be at least 3 characters' },
    max: { value: 50, message: 'Name must be at most 50 characters' }
  },
  cloudProvider: {
    required: 'Cloud provider is required'
  },
  folderPath: {
    required: 'Folder path is required',
    max: { value: 200, message: 'Folder path must be at most 200 characters' }
  }
};

export const PROVIDER_LABELS: Record<IntegrationProvider, string> = {
  'GDRIVE': 'Google Drive',
  'DROPBOX': 'Dropbox'
};