/* eslint-disable quotes */
import { Title, Container, Button, Flex, Center, Paper, Text, Group, Overlay, Stack, CopyButton, Tooltip, TextInput } from "@mantine/core"
import Head from "next/head"
import MainLayout from "../layouts/main"
import Link from "next/link"
import { connectToDatabase } from "../../lib/db"
import FreePlay from "../../models/FreePlay"
import { GetServerSidePropsContext } from "next"
import Board from "../../components/board"
import { getIronSession, IronSession } from "iron-session"
import { useState, useEffect } from "react"
import TdAIcon from "../../components/TdAIcon"
import TimeLeftText from "../../components/getTimeText"
import axios from "axios"
import { v4 as uuidv4 } from "uuid"
import { getOnTurn } from "../../lib/tictactoe"
import io from "socket.io-client"
import type { SocketWithData, SocketWithIO } from "../../pages/api/socket"
import { modals } from "@mantine/modals"
import { notifications } from "@mantine/notifications"

const sessionOptions = {
  password: process.env.SECRET_SESSION_PASSWORD as string,
  cookieName: "ssid",
  // Additional options can be added here
  cookieOptions: {
    secure: true,
  },
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  await connectToDatabase()
  const session = (await getIronSession(context.req, context.res, sessionOptions)) as IronSession<SessionData>
  const game = await FreePlay.findOne({ code: context?.params?.code })
  if (!game) {
    return { notFound: true }
  }

  if (!session.uuid) {
    session.uuid = uuidv4()
    await session.save()
  }

  if (game.opponentSessionId) {
    if (game.opponentSessionId !== session.uuid && game.creatorSessionId !== session.uuid) {
      return { notFound: true }
    }
  }

  return { props: { loadedData: JSON.parse(JSON.stringify(game)), me: session.uuid } }
}

export default function IndexPage({
  loadedData,
  me,
}: {
  loadedData: {
    uuid: string
    board: Board
    creatorStarts: boolean
    lastMoveX: number
    lastMoveY: number
    winner: string | null
    code: number
    creatorSessionId: string
    opponentSessionId: string | null
    startTime: Date | null
    finished: boolean
    creatorTimeLeft: number
    opponentTimeLeft: number
    lastMoveAt: Date
    creatorRevenge: boolean
    opponentRevenge: boolean
  }
  me: string
}) {
  const [game, setGame] = useState(loadedData)
  const [inviteLink, setInviteLink] = useState("")

  const iAmCreator = game.creatorSessionId === me
  const myPlayer = iAmCreator ? (game.creatorStarts ? "X" : "O") : game.creatorStarts ? "O" : "X"
  const onMove = getOnTurn(game.board)
  const iAmOnMove = onMove === myPlayer
  const winnerPlayer =
    game.winner === "creator" ? (game.creatorStarts ? "X" : "O") : game.winner === "opponent" ? (game.creatorStarts ? "O" : "X") : null

  function moved(x: number, y: number) {
    axios.put(`/api/v1/freeplay/${game.uuid}`, { x, y }).then((res) => {
      if (res.status === 200) {
        setGame(res.data)
      }
    })
  }

  function reachedZero() {
    setTimeout(() => {
      axios.get(`/api/v1/freeplay/${game.uuid}`)
    }, 1000)
  }

  function giveUp() {
    modals.openConfirmModal({
      title: <Title order={3}>Vzdát se</Title>,
      children: "Opravdu se chcete vzdát?",
      labels: {
        confirm: "Vzdát se",
        cancel: "Zrušit",
      },
      confirmProps: { color: "red" },
      onConfirm: () => {
        axios.delete(`/api/v1/freeplay/${game.uuid}`)
      },
    })
  }

  function joinGame() {
    axios.post(`/api/v1/freeplay/${game.uuid}/join`).then((response) => {
      if (response.status === 200) {
        notifications.show({
          message: "Hra byla zahájena",
          title: "Hra byla zahájena",
        })
      } else {
        notifications.show({
          message: "Hra již byla zahájena",
          title: "Hra již byla zahájena",
          color: "red",
        })
      }
    })
  }

  function getRevenge() {
    axios.post(`/api/v1/freeplay/${game.uuid}/revenge`).then((response) => {
      if (response.status === 200) {
        notifications.show({
          message: "Odveta byla odeslána",
        })
      }
    })
  }

  useEffect(() => {
    axios.get("/api/socket")
    const socket = io({
      query: {
        uuid: me, // Pass session UUID here
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    })

    socket.on("connect", () => {
      
    })

    socket.on(`freePlayUpdate:${game.uuid}`, (data) => {
      setGame(data)
    })

    if (typeof window !== "undefined") {
      setInviteLink(window.location.href)
    }

    // No disconnection call here, keeping the socket open
  }, [me, game.uuid])

  return (
    <>
      <Head>
        <title>Think different Academy - Volná hra</title>
        <meta name="description" content="Zahrej si proti kamarádovi piškvorky" />
      </Head>
      <MainLayout style={{ alignItems: "center", justifyContent: "center", gap: 10 }}>
        <Container style={{ height: "100%", width: "100%" }}>
          <Paper shadow="xs" p="md" radius="md" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Group>
              <TdAIcon type={myPlayer === "X" ? "O" : "X"} size={20} color={myPlayer === "X" ? "red" : "blue"} />
              <Text size="xl">
                <b>Protivník</b>
              </Text>
            </Group>
            {!iAmOnMove && <Text>Je právě na řadě</Text>}
            <TimeLeftText
              initialTimeLeft={iAmCreator ? game.opponentTimeLeft : game.creatorTimeLeft}
              startCount={!!(game.opponentSessionId && !iAmOnMove && !game.finished)}
              onCountReachZero={reachedZero}
            />
          </Paper>
          <Paper shadow="xs" p="md" radius="md">
            <Flex style={{ position: "relative", justifyContent: "center", padding: "10px" }}>
              <Board board={game.board} style={{ flex: 1 }} interative={iAmOnMove && !game.finished ? true : false} onClick={moved} />
              {game.finished && (
                <Overlay color="black">
                  <Center style={{ height: "100%", width: "100%" }}>
                    <Paper shadow="xs" p="md" radius="md">
                      <Stack gap={10} align="center">
                        <TdAIcon type={winnerPlayer ? winnerPlayer : "Thinking"} size={100} color={winnerPlayer == "O" ? "red" : "blue"} />
                        <Title order={3}>
                          {game.winner
                            ? "Vyhrál " + (game.winner == "creator" ? (iAmCreator ? "jsi!" : "protivník!") : iAmCreator ? "protivník!" : "jsi!")
                            : "Remíza"}
                        </Title>
                        {(iAmCreator ? game.opponentRevenge : game.creatorRevenge) && <Title order={3}>Protivník nabízí odvetu</Title>}
                        <Button onClick={getRevenge} disabled={iAmCreator ? game.creatorRevenge : game.opponentRevenge}>
                          Odveta
                        </Button>
                      </Stack>
                    </Paper>
                  </Center>
                </Overlay>
              )}
              {!game.opponentSessionId && iAmCreator && (
                <Overlay color="black">
                  <Center style={{ height: "100%", width: "100%" }}>
                    <Paper shadow="xs" p="md" radius="md">
                      <Stack gap={10} align="center">
                        <Title order={1}>Pošli kamarádovi pozvánku ke hře</Title>
                        <Group>
                          <CopyButton value={inviteLink} timeout={2000}>
                            {({ copied, copy }) => (
                              <>
                                <TextInput value={inviteLink} readOnly />
                                <Button onClick={copy}>{copied ? "Zkopírováno" : "Zkopírovat"}</Button>
                              </>
                            )}
                          </CopyButton>
                        </Group>
                        <Title order={4}>Kód hry</Title>
                        <Title order={2}>{game.code}</Title>
                      </Stack>
                    </Paper>
                  </Center>
                </Overlay>
              )}
              {!iAmCreator && !game.opponentSessionId && (
                <Overlay color="black">
                  <Center style={{ height: "100%", width: "100%" }}>
                    <Button onClick={joinGame}>Začít hru</Button>
                  </Center>
                </Overlay>
              )}
            </Flex>
          </Paper>
          <Paper shadow="xs" p="md" radius="md" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Group>
              <TdAIcon type={myPlayer} size={20} color={myPlayer === "X" ? "blue" : "red"} />
              <Text size="xl">
                <b>Já</b>
              </Text>
            </Group>
            {iAmOnMove && <Text>Je právě na řadě</Text>}
            <TimeLeftText
              initialTimeLeft={iAmCreator ? game.creatorTimeLeft : game.opponentTimeLeft}
              startCount={!!(game.opponentSessionId && iAmOnMove && !game.finished)}
              onCountReachZero={reachedZero}
            />
          </Paper>
        </Container>
        <Button disabled={!game.opponentSessionId || game.finished} onClick={giveUp}>
          Vzdát se
        </Button>
      </MainLayout>
    </>
  )
}
