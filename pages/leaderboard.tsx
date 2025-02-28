import { Group, Title, Center, Flex, Button, Pagination } from "@mantine/core"
import Head from "next/head"
import MainLayout from "./layouts/main"
import TdAIcon from "../components/TdAIcon"
import Link from "next/link"
import { Table } from "@mantine/core"
import { GetServerSidePropsContext } from "next"
import { connectToDatabase } from "../lib/db"
import User from "../models/User"
import { useState } from "react"

export async function getServerSideProps(context: GetServerSidePropsContext) {
  await connectToDatabase()

  const users = await User.find({})

  let leaderboard: User[] = []

  users.forEach((user) => {
    leaderboard.push({
      username: user.username,
      wins: user.wins,
      losses: user.losses,
      draws: user.draws,
      elo: user.elo,
      uuid: user.uuid,
    })
  })

  leaderboard.sort((a, b) => {
    return b.elo - a.elo
  })

  return { props: { users: JSON.parse(JSON.stringify(leaderboard)) } }
}

interface User {
  username: string
  elo: number
  uuid: string
  wins: number
  losses: number
  draws: number
}

export default function IndexPage({ users }: { users: User[] }) {
  const [activePage, setPage] = useState(1)
  const leaderboardChunks = chunk(users, 9)
  const displayedUsers = leaderboardChunks[activePage - 1]
  return (
    <>
      <Head>
        <title>Think different Academy</title>
        <meta
          name="description"
          content="Think different Academy je platforma, díky které si budou moci mladí lidé potrénovat své logické a taktické myšlení na piškvorkových úlohách."
        />
      </Head>
      <MainLayout style={{ justifyContent: "center" }}>
        <div style={{ alignSelf: "center", width: "100%", maxWidth: "800px" }}>
          <Title ta={"center"}>Žebříček</Title>
          <div>
            <Table style={{}}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Místo</Table.Th>
                  <Table.Th>Jméno</Table.Th>
                  <Table.Th>Výhry</Table.Th>
                  <Table.Th>Remízy</Table.Th>
                  <Table.Th>Prohry</Table.Th>
                  <Table.Th>ELO</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {users.map((user, index) => (
                  <Table.Tr key={user.uuid}>
                    <Table.Td>{index + 1}</Table.Td>
                    <Table.Td>
                      <Link href={"/profile/" + user.uuid}>{user.username}</Link>
                    </Table.Td>
                    <Table.Td>{user.wins}</Table.Td>
                    <Table.Td>{user.draws}</Table.Td>
                    <Table.Td>{user.losses}</Table.Td>
                    <Table.Td>{user.elo}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>
          <Flex align={"center"} justify={"center"}>
            <Pagination total={leaderboardChunks.length} value={activePage} onChange={(page) => setPage(page)} />
          </Flex>
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
