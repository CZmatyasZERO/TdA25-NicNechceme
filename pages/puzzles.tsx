
import { Group, Title, Center, Flex, Container, Button, ComboboxItem, Select, TextInput, Autocomplete, Paper, Pagination, Text, Stack } from "@mantine/core";
import { useState } from "react";
import Head from "next/head";
import MainLayout from "./layouts/main";
import TdAIcon from "../components/TdAIcon";
import IconSelect from "../components/IconSelect";
import { connectToDatabase } from '../lib/db';
import Game from '../models/Game';
import { GetServerSidePropsContext } from 'next';
import { Cell } from "./../lib/tictactoe";
import Board from "../components/board";
import { TdADifficulty, TdAGameState } from "./../lib/tda"
import Link from "next/link"

export async function getServerSideProps(context: GetServerSidePropsContext) {
  await connectToDatabase();
  const games = {Games: await Game.find({})}
  return { props: JSON.parse(JSON.stringify(games)) };
}


export default function IndexPage({ Games }: { Games: { board: Cell[][], name: string, difficulty: "beginner" | "easy" | "medium" | "hard" | "extreme", uuid: string, updatedAt: string, gameState: "opening" | "midgame" | "endgame" }[] }) {
  const [difficulty, setDifficulty] = useState<string|null>(null);
  const [lastUpdate, setLastUpdate] = useState<string|null>(null);
  const [searchPrompt, setSearchPrompt] = useState<string>("");
  const [activePage, setPage] = useState(1);

  let filteredGames = Games
  if (searchPrompt) {
    filteredGames = filteredGames.filter((game) => game.name.toLowerCase().includes(searchPrompt.toLowerCase()))
  }
  if (difficulty) {
    filteredGames = filteredGames.filter((game) => game.difficulty === difficulty)
  }
  if (lastUpdate) {
    const now = new Date();
    let dateLimit = new Date();

    switch (lastUpdate) {
      case "24h":
        dateLimit.setDate(now.getDate() - 1);
        break;
      case "7d":
        dateLimit.setDate(now.getDate() - 7);
        break;
      case "1m":
        dateLimit.setMonth(now.getMonth() - 1);
        break;
      case "3m":
        dateLimit.setMonth(now.getMonth() - 3);
        break;
      default:
        break;
    }

    filteredGames = filteredGames.filter((game) => {
      const gameDate = new Date(game.updatedAt);
      return gameDate >= dateLimit;
    });
  }

  const gamesChunks = chunk(filteredGames, 12)
  const displayedGames = gamesChunks[activePage - 1]

  return (
    <>
      <Head>
        <title>Think different Academy - Úlohy</title>
        <meta name="description" content="Prozkoumej piškvorkové úlohy a zlepši si svoje logické myšlení na Think different Academy." />
      </Head>
      <MainLayout>
          <Title order={1} ta="center" style={{marginTop: "1em"}}>
            Úlohy
          </Title>
          <Flex direction="column" align="center" gap="md" style={{width: "100%", padding: "1%", flex: 1}}>
            <Flex gap="md" justify="center" align="center" wrap="wrap" style={{width: "100%"}}>
              <TextInput
                flex={3}
                label="Název" 
                placeholder="Zadejte název..."
                value={searchPrompt}
                
                onChange={(event) => {setSearchPrompt(event.target.value); setPage(1)}}

                style={{minWidth: "300px"}}
              />
              <IconSelect
                flex={1} 
                icons={
                  {
                    beginner: <TdAIcon type="Beginner" size={18} color="blue" />,
                    easy: <TdAIcon type="Easy" size={18} color="blue" />,
                    medium: <TdAIcon type="Medium" size={18} color="blue" />,
                    hard: <TdAIcon type="Hard" size={18} color="blue" />,
                    extreme: <TdAIcon type="Extreme" size={18} color="blue" />,
                  }
                }
                
                label="Obtížnost" 
                placeholder="Vyberte obtížnost"
                data={[
                  { value: 'beginner', label: 'začátečník' },
                  { value: 'easy', label: 'jednoduchá' },
                  { value: 'medium', label: 'pokročilá' },
                  { value: 'hard', label: 'těžká' },
                  { value: 'extreme', label: 'nejtežší' },
                ]}
                value={difficulty}
                style={{minWidth: "200px"}}
                onChange={(value) => {setDifficulty(value); setPage(1)}}
              />
              <Select 
                flex={1}
                label="Poslední úprava" 
                placeholder="Za poslední..."
                data={[
                  { value: "24h", label: "24 hodin" },
                  { value: "7d", label: "7 dní" },
                  { value: "1m", label: "1 měsíc" },
                  { value: "3m", label: "3 měsíce" },
                ]} 
                value={lastUpdate}
                style={{minWidth: "200px"}}
                onChange={(value) => {setLastUpdate(value); setPage(1)}}
              />
            </Flex>
            <Flex wrap="wrap" justify="space-around" align="center" gap="lg" style={{width: "100%"}}>
                {displayedGames ? displayedGames.map((game) => {
                  return (
                    <Paper

                      key={game.uuid}
                      shadow="xs"
                      radius="md"
                      style={{ width: "32%", minWidth: "300px", padding: "5px" }}
                    >
                      <Flex wrap="wrap" justify="center">
                        <Flex justify="center" align="center" flex={1} style={{minWidth: "150px", maxWidth: "300px", padding: "1%"}}>
                          <Board fullWidth board={game.board} />
                        </Flex>
                        <Stack style={{width: "300px", padding: "5px"}}>
                          <Title order={3} style={{textOverflow: "ellipsis"}}>{game.name}</Title>
                          <Group>
                            <TdAIcon color="blue" type={game.difficulty} size={30}/>
                            <Text>{TdADifficulty[game.difficulty]}</Text>
                          </Group>
                          <Text>{TdAGameState[game.gameState]}</Text>
                          <Container flex={1}></Container>
                          <Link href={"/game/"+game.uuid}><Button fullWidth>Spustit</Button></Link>
                        </Stack>
                      </Flex>
                    </Paper>
                  );
                }) : <Center style={{width: "100%", height: "100%"}}>
                    <Text>Nenalezeny žádné úlohy</Text>
                  </Center>}
            </Flex>
            <Pagination total={gamesChunks.length} value={activePage} onChange={(page) => setPage(page)} />
          </Flex>
        
      </MainLayout>
    </>
  );
}


function chunk<T>(array: T[], size: number): T[][] {
  if (!array.length) {
    return [];
  }
  const head = array.slice(0, size);
  const tail = array.slice(size);
  return [head, ...chunk(tail, size)];
}