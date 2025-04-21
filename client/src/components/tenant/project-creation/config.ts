import { IconCloudUpload, IconFolderPlus, IconFolderSearch, IconClipboardCheck } from '@tabler/icons-react';
import { IntegrationProvider } from '../../../types';

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

export const STEPS: StepConfig[] = [
  {
    label: 'Cloud Provider',
    description: 'Select storage provider',
    icon: IconCloudUpload,
    field: 'cloudProvider',
    requiredFields: ['cloudProvider'],
    validateStep: (values) => {
      if (!values.cloudProvider) return VALIDATION_RULES.cloudProvider.required;
      return null;
    }
  },
  {
    label: 'Project Name',
    description: 'Enter project name',
    icon: IconFolderPlus,
    field: 'name',
    requiredFields: ['name'],
    validateStep: (values) => {
      const rules = VALIDATION_RULES.name;
      if (!values.name) return rules.required;
      if (values.name.length < rules.min.value) return rules.min.message;
      if (values.name.length > rules.max.value) return rules.max.message;
      return null;
    }
  },
  {
    label: 'Select Folder',
    description: 'Choose location',
    icon: IconFolderSearch,
    field: 'folderPath',
    requiredFields: ['folderPath', 'cloudProvider'],
    validateStep: (values) => {
      const rules = VALIDATION_RULES.folderPath;
      if (!values.folderPath) return rules.required;
      if (values.folderPath.length > rules.max.value) return rules.max.message;
      return null;
    }
  },
  {
    label: 'Review',
    description: 'Confirm details',
    icon: IconClipboardCheck,
    field: 'name',
    requiredFields: ['name', 'cloudProvider', 'folderPath'],
    validateStep: (values) => {
      // Validate all fields
      for (const field of ['name', 'cloudProvider', 'folderPath'] as const) {
        const error = STEPS.find(s => s.field === field)?.validateStep?.(values);
        if (error) return error;
      }
      return null;
    }
  }
];

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

export const PROVIDER_LABELS: Record<IntegrationProvider, string> = {
  'GDRIVE': 'Google Drive',
  'DROPBOX': 'Dropbox'
};