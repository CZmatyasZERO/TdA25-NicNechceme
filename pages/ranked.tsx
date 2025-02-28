import { Group, Title, Center, Flex, Button, PinInput, Paper } from "@mantine/core"
import Head from "next/head"
import MainLayout from "./layouts/main"
import { useRouter } from "next/router"
import axios from "axios"
import { notifications } from "@mantine/notifications"
import { GetServerSidePropsContext } from "next"
import { getIronSession, IronSession } from "iron-session"
import { useEffect } from "react"
import io from "socket.io-client"

const sessionOptions = {
  password: process.env.SECRET_SESSION_PASSWORD as string,
  cookieName: "ssid",
  // Additional options can be added here
  cookieOptions: {
    secure: true,
  },
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = (await getIronSession(context.req, context.res, sessionOptions)) as IronSession<SessionData>

  if (!session.loggedIn) {
    return { redirect: { destination: "/login", permanent: false } }
  }

  return { props: { me: session.uuid } }
}

export default function IndexPage({ me }: { me: string }) {
  const router = useRouter()
  function stopSearch() {
    axios.delete("/api/v1/ranked").then((response) => {
      if (response.status === 200) {
        notifications.show({
          title: "Hledání hry bylo zastaveno",
          message: "Hledání hry bylo zastaveno",
        })
        router.replace("/play", undefined, { shallow: true })
      }
    })
  }

  useEffect(() => {
    fetch("/api/socket")
    axios.post("/api/v1/ranked").then((response) => {
      if (response.status === 201) {
        notifications.show({
          title: "Hledání hry bylo zahájeno",
          message: "Hledání hry bylo zahájeno",
        })
      } else if (response.status === 203) {
        router.replace("/ranked/" + response.data.uuid, undefined, { shallow: true })
      }
    })
    const interval = setInterval(() => {
      axios.get("/api/v1/ranked")
      axios.post("/api/v1/ranked").then((response) => {
        if (response.status === 203) {
          clearInterval(interval)
          router.replace("/ranked/" + response.data.uuid, undefined, { shallow: true })
        }
      })
    }, 5000)
    // No disconnection call here, keeping the socket open
  })

  return (
    <>
      <Head>
        <title>Think different Academy - Připojit ke hře</title>
      </Head>
      <MainLayout>
        <Center>
          <Paper shadow="xs" p="md" radius="md" style={{ width: "100%", maxWidth: "500px" }}>
            <Flex direction="column" align="center" justify="center" gap={20}>
              <Title order={1}>Hledáme pro vás hru</Title>
              <Title order={2}>prosím nezavírejte toto okno</Title>
              <Button onClick={stopSearch}>Zrušit hledání</Button>
            </Flex>
          </Paper>
        </Center>
      </MainLayout>
    </>
  )
}
