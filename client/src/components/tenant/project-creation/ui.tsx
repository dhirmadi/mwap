import { Paper, Text, Group } from '@mantine/core';
import { ReactNode } from 'react';

interface FormSectionProps {
  children: ReactNode;
}

export function FormSection({ children }: FormSectionProps) {
  return (
    <Paper withBorder p="md" mt="md">
      {children}
    </Paper>
  );
}

interface FieldLabelProps {
  children: ReactNode;
}

export function FieldLabel({ children }: FieldLabelProps) {
  return (
    <Text fw={500} size="sm" style={{ width: 120 }}>
      {children}
    </Text>
  );
}

interface FieldValueProps {
  children: ReactNode;
  wrap?: boolean;
}

export function FieldValue({ children, wrap = false }: FieldValueProps) {
  return (
    <Text size="sm" style={wrap ? { wordBreak: 'break-all' } : undefined}>
      {children}
    </Text>
  );
}

interface ReviewFieldProps {
  label: string;
  value: ReactNode;
  wrap?: boolean;
}

export function ReviewField({ label, value, wrap }: ReviewFieldProps) {
  return (
    <Group>
      <FieldLabel>{label}:</FieldLabel>
      <FieldValue wrap={wrap}>{value}</FieldValue>
    </Group>
  );
}