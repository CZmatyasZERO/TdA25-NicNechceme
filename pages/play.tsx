import { Group, Title, Center, Flex, Button, Paper, Text } from "@mantine/core"
import Head from "next/head"
import MainLayout from "./layouts/main"
import TdAIcon from "./../components/TdAIcon"
import Link from "next/link"

export default function IndexPage() {
  return (
    <>
      <Head>
        <title>Think different Academy - Výběr módu hry</title>
      </Head>
      <MainLayout>
        <Center>
          <Flex gap={15} justify={"center"} wrap={"wrap"} align={"center"} style={{ maxWidth: 800 }}>
            <Paper shadow="xs" p="md" radius="md" style={{ maxWidth: "500px", minWidth: "350px" }}>
              <Flex align={"center"} justify={"center"} direction={"column"} gap={10}>
                <TdAIcon type="duck" size={250} color="black" />
                <Title ta={"center"} order={1}>Guest play</Title>
                <Text ta={"center"}>Začněte hrát jako guest a vyhrajte si nové hry!</Text>
                <Button fullWidth>
                    Vytvořit novou hru
                </Button>
              </Flex>
            </Paper>
          </Flex>
          <Flex gap={15} justify={"center"} wrap={"wrap"} align={"center"} style={{ maxWidth: 800 }}>
            <Paper shadow="xs" p="md" radius="md" style={{ maxWidth: "500px", minWidth: "350px" }}>
              <Flex align={"center"} justify={"center"} direction={"column"} gap={10}>
                <TdAIcon type="Thinking" size={250} color="black" />
                <Title ta={"center"} order={1}>analýza</Title>
                <Text ta={"center"}>Zkoušejte nové strategie a vytvářejte nové úlohy!</Text>
                <Link href="/game" prefetch style={{ width: "100%" }}>
                  <Button style={{ width: "100%" }}>
                    Hrát
                  </Button>
                </Link>
              </Flex>
            </Paper>
          </Flex>
        </Center>
      </MainLayout>
    </>
  )
}
