import React from 'react';
import { Header as MantineHeader, Container, Group, Title } from '@mantine/core';
import { UserMenu } from './UserMenu';

export function Header() {
  return (
    <MantineHeader height={60}>
      <Container size="lg" h="100%">
        <Group position="apart" h="100%" px="md">
          <Title order={3}>MWAP</Title>
          <UserMenu />
        </Group>
      </Container>
    </MantineHeader>
  );
}