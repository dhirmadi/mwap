import { Container, ContainerProps } from '@mantine/core';

/**
 * Props for PageLayout component
 */
export interface PageLayoutProps extends Omit<ContainerProps, 'children'> {
  readonly children: React.ReactNode;
}

/**
 * Standard page layout with consistent spacing
 * 
 * @example
 * ```tsx
 * <PageLayout>
 *   <Content />
 * </PageLayout>
 * ```
 */
export function PageLayout({
  children,
  size = 'md',
  py = 'xl',
  ...props
}: PageLayoutProps): JSX.Element {
  return (
    <Container
      size={size}
      py={py}
      {...props}
    >
      {children}
    </Container>
  );
}