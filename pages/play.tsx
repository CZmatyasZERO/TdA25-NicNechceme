import { Group, Title, Center, Flex, Button, Paper, Text } from "@mantine/core"
import Head from "next/head"
import MainLayout from "./layouts/main"
import TdAIcon from "./../components/TdAIcon"
import Link from "next/link"
import axios from "axios"
import { notifications } from "@mantine/notifications"
import { useRouter } from "next/router"
import { useState, useEffect } from "react"

export default function IndexPage() {
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    axios.get("/api/v1/user/status").then((response) => {
      if (response.status === 201) {
        setLoggedIn(response.data.loggedIn)
      }
    })
  })

  function guestPlay() {
    if (loggedIn) {
      axios.post("/api/v1/freeplay").then((response) => {
        if (response.status === 201) {
          router.replace("/freeplay/" + response.data.code, undefined, {
            shallow: true,
          })
        } else {
          notifications.show({
            title: "Chyba",
            message: "Nelze vytvořit hru",
            color: "red",
          })
        }
      })
    } else {
      router.replace("/login", undefined, {
        shallow: true,
      })
    }
  }

  return (
    <>
      <Head>
        <title>Think different Academy - Výběr módu hry</title>
      </Head>
      <MainLayout>
        <Center>
          <Flex justify={"center"} align={"stretch"} gap={15} wrap={"wrap"}>
            <Flex gap={15} justify={"center"} wrap={"wrap"} align={"center"} style={{ maxWidth: 800 }}>
              <Paper shadow="xs" p="md" radius="md" style={{ maxWidth: "500px", minWidth: "350px" }}>
                <Flex align={"center"} justify={"center"} direction={"column"} gap={10}>
                  <TdAIcon type="duck" size={250} color="black" />
                  <Title ta={"center"} order={1}>
                    Pozvánka pro kámoše
                  </Title>
                  <Text ta={"center"}>Začněte hrát jako guest a vyhrajte si nové hry!</Text>
                  <Button fullWidth onClick={guestPlay}>
                    {loggedIn ? "Vytvořit novou hru" : "Přihlásit se pro vytvoření hry"}
                  </Button>
                  <Link href="/freeplaycode" style={{ width: "100%", textDecoration: "none" }} prefetch>
                    <Button fullWidth variant="transparent" style={{ width: "100%" }}>
                      Zadat kód pro připojení
                    </Button>
                  </Link>
                </Flex>
              </Paper>
            </Flex>
            <Flex gap={15} justify={"center"} wrap={"wrap"} align={"center"} style={{ maxWidth: 800 }}>
              <Paper shadow="xs" p="md" radius="md" style={{ maxWidth: "500px", minWidth: "350px" }}>
                <Flex align={"center"} justify={"center"} direction={"column"} gap={10}>
                  <TdAIcon type="duck" size={250} color="black" />
                  <Title ta={"center"} order={1}>
                    Hodnocená hra
                  </Title>
                  <Text ta={"center"}>Hrajte s lidmi online s podobným hodnocením. Hra může mít vliv na vaše hodnocení.</Text>
                  <Link href={loggedIn ? "/ranked" : "/login"} style={{ width: "100%" }}>
                    <Button style={{ width: "100%" }}>Hrát</Button>
                  </Link>
                </Flex>
              </Paper>
            </Flex>
            <Flex gap={15} justify={"center"} wrap={"wrap"} align={"center"} style={{ maxWidth: 800 }}>
              <Paper shadow="xs" p="md" radius="md" style={{ maxWidth: "500px", minWidth: "350px" }}>
                <Flex align={"center"} justify={"center"} direction={"column"} gap={10}>
                  <TdAIcon type="Thinking" size={250} color="black" />
                  <Title ta={"center"} order={1}>
                    Analýza
                  </Title>
                  <Text ta={"center"}>Zkoušejte nové strategie a vytvářejte nové úlohy!</Text>
                  <Link href="/game" prefetch style={{ width: "100%" }}>
                    <Button style={{ width: "100%" }}>Hrát</Button>
                  </Link>
                </Flex>
              </Paper>
            </Flex>
          </Flex>
        </Center>
      </MainLayout>
    </>
  )
}
