import { Group, Title, Center, Flex, Button } from "@mantine/core"
import Head from "next/head"
import MainLayout from "./layouts/main"
import TdAIcon from "./../components/TdAIcon"
import Link from "next/link"

export default function IndexPage() {
  return (
    <>
      <Head>
        <title>Think different Academy - Stránka nenalezena</title>
      </Head>
      <MainLayout>
        <Center>
          <Flex gap={15} justify={"center"} direction={"column"} align={"center"} style={{ maxWidth: 800 }}>
            <TdAIcon type="duck" size={250} color="black" />
            <Title order={1}>404 - Stránka nenalezena</Title>
            <Title order={2} ta="center">
              Nemáte na mysli, že se nám jedná o stránku, kterou hledáte? Pokud to není tak, zkuste nám prosím kontaktovat.
            </Title>
            <Group>
              <Link href="/puzzles" prefetch>
                <Button size="xl">Zpět na úlohy</Button>
              </Link>
              <Link href="/about" prefetch>
                <Button size="xl">Napište nám</Button>
              </Link>
            </Group>
          </Flex>
        </Center>
      </MainLayout>
    </>
  )
}
