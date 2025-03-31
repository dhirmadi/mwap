import { AppShell, Header, Container, Group, Title } from '@mantine/core';
import { Home } from './pages/Home';

function App() {
  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Container size="lg">
          <Group h="100%" px="md">
            <Title order={3}>NWAP Mini</Title>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Home />
      </AppShell.Main>
    </AppShell>
  )
}

export default App
