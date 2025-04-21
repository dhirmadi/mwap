import { IconCloudUpload, IconFolderPlus, IconFolderSearch, IconClipboardCheck } from '@tabler/icons-react';
import { IntegrationProvider } from '../../../types';

export const VALIDATION_RULES = {
  name: {
    required: 'Name is required',
    min: { value: 3, message: 'Name must be at least 3 characters' },
    max: { value: 50, message: 'Name must be at most 50 characters' },
    description: 'Project name should be 3-50 characters long'
  },
  cloudProvider: {
    required: 'Cloud provider is required',
    description: 'Select where to store project files'
  },
  folderPath: {
    required: 'Folder path is required',
    max: { value: 200, message: 'Folder path must be at most 200 characters' },
    description: 'Double-click a folder to select it as the project location'
  }
};

export interface StepConfig {
  label: string;
  description: string;
  icon: typeof IconCloudUpload;
  field: keyof FormValues;
  requiredFields: Array<keyof FormValues>;
  validateStep?: (values: FormValues) => string | null;
}

export interface FormValues {
  name: string;
  cloudProvider: IntegrationProvider;
  folderPath: string;
}

// Common validation function
const validateField = (field: keyof FormValues, value: string | undefined, rules: typeof VALIDATION_RULES[keyof typeof VALIDATION_RULES]) => {
  if (!value) return rules.required;
  if ('min' in rules && value.length < rules.min.value) return rules.min.message;
  if ('max' in rules && value.length > rules.max.value) return rules.max.message;
  return null;
};

export const STEPS: StepConfig[] = [
  {
    label: 'Cloud Provider',
    description: 'Select storage provider',
    icon: IconCloudUpload,
    field: 'cloudProvider',
    requiredFields: ['cloudProvider'],
    validateStep: (values) => validateField('cloudProvider', values.cloudProvider, VALIDATION_RULES.cloudProvider)
  },
  {
    label: 'Project Name',
    description: 'Enter project name',
    icon: IconFolderPlus,
    field: 'name',
    requiredFields: ['name'],
    validateStep: (values) => validateField('name', values.name, VALIDATION_RULES.name)
  },
  {
    label: 'Select Folder',
    description: 'Choose location',
    icon: IconFolderSearch,
    field: 'folderPath',
    requiredFields: ['folderPath', 'cloudProvider'],
    validateStep: (values) => validateField('folderPath', values.folderPath, VALIDATION_RULES.folderPath)
  },
  {
    label: 'Review',
    description: 'Confirm details',
    icon: IconClipboardCheck,
    field: 'name',
    requiredFields: ['name', 'cloudProvider', 'folderPath'],
    validateStep: (values) => {
      for (const field of ['name', 'cloudProvider', 'folderPath'] as const) {
        const error = validateField(field, values[field], VALIDATION_RULES[field]);
        if (error) return error;
      }
      return null;
    }
  }
];

export const PROVIDER_LABELS: Record<IntegrationProvider, string> = {
  'GDRIVE': 'Google Drive',
  'DROPBOX': 'Dropbox'
};