import Head from "next/head"
import MainLayout from "../layouts/main"
import Link from "next/link"
import {
  Table,
  Group,
  Title,
  Center,
  Flex,
  Container,
  Button,
  Paper,
  Tabs,
  Checkbox,
  Stack,
  Select,
  ComboboxItem,
  TextInput,
  Text,
  NumberInput,
  Overlay,
  Pagination,
} from "@mantine/core"
import User from "../../models/User"
import Ranked from "../../models/Ranked"
import { GetServerSidePropsContext } from "next"
import { connectToDatabase } from "../../lib/db"
import { getIronSession, IronSession } from "iron-session"
import { useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"

interface User {
  uuid: string
  username: string
  elo: number
  wins: number
  losses: number
  draws: number
  createdAt: Date
}

const sessionOptions = {
  password: process.env.SECRET_SESSION_PASSWORD as string,
  cookieName: "ssid",
  // Additional options can be added here
  cookieOptions: {
    secure: true,
  },
}

interface GameLog {
  uuid: string
  elo: number
  opponentUUID: string
  opponentUsername: string
  opponentELO: number
  result: string
  date: string | Date
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  await connectToDatabase()

  const session = (await getIronSession(context.req, context.res, sessionOptions)) as IronSession<SessionData>
  const user = await User.findOne({ uuid: context?.params?.uuid })

  if (!user) {
    return { notFound: true }
  }

  const games = await Ranked.find({
    $or: [{ creatorSessionId: context?.params?.uuid }, { opponentSessionId: context?.params?.uuid }],
  })

  var gameLogs: GameLog[] = []

  for (let game of games) {
    const IsCreator = game.creatorSessionId === context?.params?.uuid
    if (IsCreator) {
      let opponentUser = await User.findOne({ uuid: game.opponentSessionId })
      if (opponentUser) {
        gameLogs.push({
          uuid: game.uuid,
          elo: game.creatorELO,
          opponentUUID: opponentUser.uuid,
          opponentUsername: opponentUser.username,
          opponentELO: game.opponentELO,
          result: game.winner ? (game.winner === "creator" ? "win" : "lose") : "draw",
          date: game.startedAt,
        })
      }
    } else {
      let creatorUser = await User.findOne({ uuid: game.creatorSessionId })
      if (creatorUser) {
        gameLogs.push({
          uuid: game.uuid,
          elo: game.opponentELO,
          opponentUUID: creatorUser.uuid,
          opponentUsername: creatorUser.username,
          opponentELO: game.creatorELO,
          result: game.winner ? (game.winner === "creator" ? "lose" : "win") : "draw",
          date: game.startedAt,
        })
      }
    }
  }


  let isItMe = false
  if (session.loggedIn) {
    if (user.uuid === session.uuid) {
      isItMe = true
    }
  }

  return { props: { gameLogs: JSON.parse(JSON.stringify(gameLogs)), user: JSON.parse(JSON.stringify(user)), isItMe: isItMe } }
}

export default function IndexPage({ gameLogs, user, isItMe }: { gameLogs: GameLog[]; user: User; isItMe: boolean }) {
  const router = useRouter()
  const [activePage, setPage] = useState(1)
  const gameChunks = chunk(gameLogs, 9)
  const displayedGames = gameChunks[activePage - 1]

  function logout() {
    axios.post("/api/v1/user/logout").then((response) => {
      if (response.status === 200) {
        router.replace("/login", undefined, {
          shallow: true,
        })
      }
    })
  }
  return (
    <>
      <Head>
        <title>Think different Academy</title>
        <meta
          name="description"
          content="Think different Academy je platforma, díky které si budou moci mladí lidé potrénovat své logické a taktické myšlení na piškvorkových úlohách."
        />
      </Head>
      <MainLayout style={{ justifyContent: "center", alignItems: "center", display: "flex" }}>
        <div style={{ alignSelf: "center", width: "100%", maxWidth: "800px" }}>
          <div style={{ maxWidth: "800px", width: "100", alignSelf: "flex-start", display: "flex", justifyContent: "space-between" }}>
            <Title>Profil</Title>
            {isItMe && <Button onClick={logout}>Odhlásit se</Button>}
          </div>
          <Paper style={{ display: "flex", maxWidth: "800px", maxHeight: "600px", height: "100%", width: "100%" }} shadow="xs" p="md" radius="md">
            <div>
              <p>Jméno</p>
              <p>Datum připojení</p>
              <p>Elo</p>
              <p>Počet her</p>
              <p>Výhry</p>
              <p>Remízy</p>
              <p>Prohry</p>
            </div>
            <div style={{ margin: "auto" }}>
              <p>{user.username}</p>
              <p suppressHydrationWarning>{new Date(user.createdAt).toLocaleDateString()}</p>
              <p>{user.elo}</p>
              <p>{user.wins + user.draws + user.losses}</p>
              <p>{user.wins}</p>
              <p>{user.draws}</p>
              <p>{user.losses}</p>
            </div>
          </Paper>
        </div>
        <div style={{ alignSelf: "center", width: "100%", maxWidth: "800px" }}>
          <div style={{ alignItems: "flex-start", display: "flex", maxWidth: "1000px" }}>
            <Title>Seznam her</Title>
          </div>
          <div>
            <Table style={{}}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Hra</Table.Th>
                  <Table.Th>Výsledek</Table.Th>
                  <Table.Th>Datum</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {displayedGames &&
                  displayedGames.map((game, index) => (
                    <Table.Tr key={game.uuid}>
                      <Table.Td>
                        <b>{user.username}</b> ({game.elo}) vs <b>{game.opponentUsername}</b> ({game.opponentELO})
                      </Table.Td>
                      <Table.Td>{game.result == "win" ? "Výhra" : game.result == "lose" ? "Prohra" : "Remíza"}</Table.Td>
                      <Table.Td suppressHydrationWarning>{new Date(game.date).toLocaleDateString()}</Table.Td>
                    </Table.Tr>
                  ))}
              </Table.Tbody>
            </Table>
            <Pagination total={gameChunks.length} value={activePage} onChange={(page) => setPage(page)} />
          </div>
        </div>
      </MainLayout>
    </>
  )
}

function chunk<T>(array: T[], size: number): T[][] {
  if (!array.length) {
    return []
  }
  const head = array.slice(0, size)
  const tail = array.slice(size)
  return [head, ...chunk(tail, size)]
}
