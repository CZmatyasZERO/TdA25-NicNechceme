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
} from "@mantine/core"

export default function IndexPage() {
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
          <div style={{ maxWidth: "800px", width: "100", alignSelf: "flex-start" }}>
            <Title>Profil</Title>
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
              <p>IMAN</p>
              <p>2022-01-01</p>
              <p>10</p>
              <p>100</p>
              <p>0</p>
              <p>0</p>
              <p>0</p>
            </div>
          </Paper>
        </div>
        <div style={{ alignSelf: "center", width: "100%", maxWidth: "800px" }}>
          <div style={{ alignItems: "flex-start", display: "flex", maxWidth: "1000px" }}>
            <Title>Sáznam her</Title>
          </div>
          <div>
            <Table style={{}}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Protihráč</Table.Th>
                  <Table.Th>Výsledek</Table.Th>
                  <Table.Th>ELO před zápasem</Table.Th>
                  <Table.Th>ELO po zápase</Table.Th>
                </Table.Tr>
              </Table.Thead>
            </Table>
          </div>
        </div>
      </MainLayout>
    </>
  )
}
