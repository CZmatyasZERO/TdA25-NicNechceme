
import { Group, Title, Center, Flex, Container, Button } from "@mantine/core";
import Head from "next/head";
import MainLayout from "./layouts/main";

  export default function IndexPage() {
    return (
      <>
        <Head>
          <title>Think different Academy</title>
          <meta name="description" content="Think different Academy je platforma, díky které si budou moci mladí lidé potrénovat své logické a taktické myšlení na piškvorkových úlohách." />
        </Head>
        <MainLayout>
          <Container component="span" style={{ maxWidth: 800, margin: 30 }}>
            <Title order={1} size={64}>
              Pojď si zahrát piškvorky s námi!
            </Title>
            <Title order={2} size={32}>
              S naší platformou si procvičíš logiku, strategii a taktické myšlení, ať už jsi úplný začátečník nebo zkušený hráč. Připrav se na výzvu a ukaž, co v tobě je!
            </Title>
            <Button size="xl">Začít hrát</Button>
          </Container>
        </MainLayout>
      </>
    );
  }
