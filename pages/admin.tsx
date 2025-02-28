import Head from "next/head"
import MainLayout from "./layouts/main"
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
import User from "../models/User"
import Ranked from "../models/Ranked"
import { GetServerSidePropsContext } from "next"
import { connectToDatabase } from "../lib/db"
import { getIronSession, IronSession } from "iron-session"
import { useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import { notifications } from "@mantine/notifications"

interface User {
  uuid: string
  username: string
  elo: number
  wins: number
  losses: number
  draws: number
  createdAt: Date
  banned: boolean
}

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
  const user = await User.findOne({ uuid: session.uuid })

  if (!user) {
    return { notFound: true }
  }

  if (!user.admin) {
    return { notFound: true }
  }

  if (!session.loggedIn) {
    return { notFound: true }
  }

  const users = await User.find({})

  return { props: { users: JSON.parse(JSON.stringify(users)) } }
}

export default function IndexPage({ users }: { users: User[] }) {
  const router = useRouter()
  const [activePage, setPage] = useState(1)
  const userChunks = chunk(users, 9)
  const displayedUsers = userChunks[activePage - 1]

  function banUser(uuid: string) {
    axios.put(`/api/v1/ban/${uuid}`).then((response) => {
      if (response.status === 200) {
        notifications.show({
          message: "Uživatel byl zabanován",
          title: "Uživatel byl zabanován",
        })
        router.reload()
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
        <Title>Admin panel</Title>
        <div style={{ alignSelf: "center", width: "100%", maxWidth: "800px" }}>
          <div style={{ alignItems: "flex-start", display: "flex", maxWidth: "1000px" }}></div>
          <div>
            <Table style={{}}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Uživatel</Table.Th>
                  <Table.Th>Ban</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {displayedUsers &&
                  displayedUsers.map((user, index) => (
                    <Table.Tr key={user.uuid}>
                      <Table.Td>
                        <b>{user.username}</b>
                      </Table.Td>
                      <Table.Td>
                        <Button variant={user.banned ? "outline" : "filled"} onClick={() => banUser(user.uuid)}>
                          {user.banned ? "Odbanovat" : "Zabanovat"}
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
              </Table.Tbody>
            </Table>
            <Pagination total={userChunks.length} value={activePage} onChange={(page) => setPage(page)} />
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
