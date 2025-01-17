
import { Group, Title, Center, Flex, Container, Button, Paper, Tabs, Checkbox, Stack, Select, ComboboxItem, TextInput, Text, NumberInput, Overlay } from "@mantine/core";
import { useForm, Form } from '@mantine/form';
import Head from "next/head";
import MainLayout from "./layouts/main";
import Board from "../components/board";
import { checkGameEnd, Cell, createEmptyBoard, findBestMove } from "./../lib/tictactoe"
import { useState, useEffect } from "react";
import TdAIcon from "../components/TdAIcon";
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import { notifications } from '@mantine/notifications';
import IconSelect from "../components/IconSelect";
import axios, { all } from "axios";
import { useRouter } from "next/router";
import { TdADifficulty } from "../lib/tda";
import { modals } from '@mantine/modals';

const createPuzzleFormSchema = z.object({
  name: z.string().min(1),
  difficulty: z.enum(['beginner', 'easy', 'medium', 'hard', 'extreme']),
});


export default function NewGamePage() {
  return <GamePage />
}


export function GamePage({ savedGame }: { savedGame?: { board: Cell[][], name: string, difficulty: "beginner" | "easy" | "medium" | "hard" | "extreme", uuid: string } }) {
  const router = useRouter()
  
  if(!savedGame) {
      savedGame = { board: createEmptyBoard(), name: "", difficulty: "beginner", uuid: "" }
  }


  const createPuzzleForm = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      difficulty: '',
    },

    validate: zodResolver(createPuzzleFormSchema),
  });


  const editPuzzleForm = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: savedGame.name,
      difficulty: savedGame.difficulty,
    },

    validate: zodResolver(createPuzzleFormSchema),
  });

  function createPuzzleSubmit(values: any) {
    let data = {...values, board}
    try {
      axios.post('/api/v1/games', data).then((response) => {
        if(response.status === 201) {
          notifications.show({
            title: 'Úloha byla uložena',
            message: 'Uložení úlohy proběhlo úspěšně',
          });
          router.replace('/game/' + response.data.uuid, undefined, { shallow: true })
          setIsModified(false);
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  function editPuzzleSubmit(values: any) {
    let data = {...values, board: savedGame?.board}
    try {
      axios.post('/api/v1/games', data).then((response) => {
        if(response.status === 201) {
          notifications.show({
            title: 'Úloha byla upravena',
            message: 'ˇUpravení úlohy proběhlo úspěšně',
          });
          router.reload();
          setIsModified(false);
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  function deletePuzzle() {
    modals.openConfirmModal({
      title: <Title order={3}>Smazat úlohu</Title>,
      children: 'Opravdu chcete smazat tuto úlohu?',
      labels: {
        confirm: 'Smazat',
        cancel: 'Zrušit',
      },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        axios.delete('/api/v1/games/' + savedGame?.uuid).then((response) => {
          if(response.status === 200) {
            notifications.show({
              title: 'Úloha byla smazána',
              message: 'Úloha byla smazána',
            });
            router.push("/puzzles", undefined, { shallow: true })
          }
        });
      },
    });
  }

  const [board, setBoard] = useState<Cell[][]>(savedGame.board);
  const [allowBot, setAllowBot] = useState(false);
  const [isModified, setIsModified] = useState(false);


  const moveCount = board.reduce((acc, row) => acc + row.filter((cell) => cell !== "").length, 0)
  const round = Math.floor(moveCount / 2)
  const onTurn = moveCount % 2 === 0 ? "X" : "O"
  const gameResult = checkGameEnd(board)

  const [botMode, setBotMode] = useState<ComboboxItem>(onTurn == "X" ? { value: 'O', label: 'Kolečka' } : { value: 'X', label: 'Křížky' });
  const [touchMode, setTouchMode] = useState(false);
  const [projectorMode, setProjectorMode] = useState(false);
  const [touchModeDoubleClick, setTouchModeDoubleClick] = useState({x: -1, y: -1});
  const [timeLimit, setTimeLimit] = useState(100);

  function moved(x: number, y: number) {
    if(touchMode && !(allowBot && botMode.value == onTurn)) {
        if(!(touchModeDoubleClick.x === x && touchModeDoubleClick.y === y)) {
            setTouchModeDoubleClick({x, y});
            return;
        }
    }
    setBoard(board => {
        const newBoard = [...board];
        newBoard[x][y] = onTurn;
        return newBoard;
    });
    if(!isModified) {
        setIsModified(true);
    }
  }

  if(allowBot) {
    if(!gameResult.finished) {
      if(botMode.value == onTurn) {
        let bestMove = findBestMove(board, botMode.value, 1000)
        moved(bestMove.x, bestMove.y)
      }
    }
  }

  useEffect(() => {
    setBoard(savedGame.board);
  }, []);

  return (
    <>
      <Head>
        <title>Think different Academy - {savedGame.uuid !== "" ? savedGame.name : "nová hra"}</title>
        <meta name="description" content="Pojď si zahrát piškvorky s náma!" />
      </Head>
      <MainLayout>
          <Center>
            <Flex gap={10} wrap="wrap" justify="center" style={{width: "100%", maxWidth: "1000px"}}>

              <Paper shadow="xs" p="md" radius="md" style={{flex: 2, maxWidth: "500px", minWidth: "350px", aspectRatio: "1/1", position: "relative"}}>
                  
                  <Board board={board} onClick={moved} interative={!allowBot || (allowBot && botMode.value !== onTurn)} lines={projectorMode} />
                  {gameResult.finished && <Overlay color="black">
                    <Center style={{height: "100%", width: "100%"}}>
                      <Paper shadow="xs" p="md" radius="md">
                        <Stack gap={10} align="center">
                          <TdAIcon type={gameResult.winner ? gameResult.winner : "Thinking"} size={100} color={gameResult.winner ? (gameResult.winner === "X" ? "blue" : "red") : "black"} />
                          <Title order={3}>{gameResult.winner ? "Vyhráli " + (gameResult.winner == "X" ? "křížky!" : "kolečka!") : "Remíza"}</Title>
                          <Group>
                            <Button onClick={() => router.reload()}>Opakovat</Button>
                          </Group>
                        </Stack>
                      </Paper>
                      
                    </Center>
                  </Overlay>}
                </Paper>
                <Paper shadow="xs" p="md" radius="md" style={{flex: 1, minWidth: "230px", maxWidth: "350px"}}>
                  <Tabs defaultValue={savedGame.uuid !== "" ? "puzzle" : "game"}>
                    <Tabs.List>
                      <Tabs.Tab value="game" >
                        Hra
                      </Tabs.Tab>
                      {savedGame.uuid !== "" && <Tabs.Tab value="puzzle" hidden={savedGame.uuid !== ""}>
                        Úloha
                      </Tabs.Tab>}
                      
                      <Tabs.Tab value="settings" >
                        Nastavení
                      </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="game">
                      <Stack gap={10}>
                        <Title order={2}>Hra</Title>
                        <Group>
                          <Text><b>Na řadě jsou:</b> {onTurn === "X" ? "Křížky" : "Kolečka"}</Text>
                          <TdAIcon size={20} color={onTurn === "X" ? "blue" : "red"} type={onTurn} />
                        </Group>

                        <Group>
                          <Text><b>Kolo číslo:</b> {round}</Text>
                        </Group>

                        <Title order={3}>Uložit jako úlohu</Title>
                        <form onSubmit={createPuzzleForm.onSubmit((values) => createPuzzleSubmit(values))}>
                          <TextInput
                            required
                            label="Název"
                            placeholder="Úloha"
                            key={createPuzzleForm.key('name')}
                            {...createPuzzleForm.getInputProps('name')}
                          />

                          <IconSelect 
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
                            required
                            data={[
                              { value: 'beginner', label: 'začátečník' },
                              { value: 'easy', label: 'jednoduchá' },
                              { value: 'medium', label: 'pokročilá' },
                              { value: 'hard', label: 'těžká' },
                              { value: 'extreme', label: 'nejtežší' },
                            ]} 
                            key={createPuzzleForm.key('difficulty')}
                            {...createPuzzleForm.getInputProps('difficulty')}
                          />

                          <Group justify="flex-end" mt="md">
                            <Button type="submit" disabled={!isModified || gameResult.finished}>Uložit</Button>
                          </Group>
                        </form>
                      </Stack>
                  
                    </Tabs.Panel>

                    <Tabs.Panel value="settings">
                        <Stack gap={10}>
                          <Title order={2}>Nastavení</Title>
                          <Checkbox label="Hrát proti botovi" checked={allowBot} onChange={(event) => setAllowBot(event.currentTarget.checked)} />
                          <Checkbox label="Režim pro dotykové obrazovky" checked={touchMode} onChange={(event) => setTouchMode(event.currentTarget.checked)} />
                          <Checkbox label="Režim pro projektor" checked={projectorMode} onChange={(event) => setProjectorMode(event.currentTarget.checked)} />
                          <Title order={3}>Nastavení bota</Title>
                          <IconSelect
                            label="Za co hraje bot"
                            data={[
                              { value: 'X', label: 'Křížky' },
                              { value: 'O', label: 'Kolečka' },
                            ]}
                            icons={
                              {
                                X: <TdAIcon type="X" size={18} color="blue" />,
                                O: <TdAIcon type="O" size={18} color="red" />,
                              }
                            }
                            value={botMode ? botMode.value : null}
                            onChange={(_value, option) => setBotMode(option)}
                            disabled={!allowBot}
                            required
                          />
                          <NumberInput
                            label="Maximální doba tahu"
                            placeholder="Doba"
                            suffix=" ms"
                            required
                            value={timeLimit}
                            onChange={(value) => setTimeLimit(Number(value))}
                            min={10}
                            max={1000}
                            disabled={!allowBot}
                            step={10}
                          />
                          
                        </Stack>
                        
                    </Tabs.Panel>
                    <Tabs.Panel value="puzzle">

                      {savedGame.uuid !== "" && <Stack gap={10}>
                        
                        <Title order={2}>Úloha</Title>
                        <Group>
                          <Text><b>Název:</b> {savedGame.name}</Text>
                        </Group>
                        <Group>
                          <Text><b>Obtížnost:</b> {TdADifficulty[savedGame.difficulty]}</Text>
                          <TdAIcon size={30} type={savedGame.difficulty} color="blue" />
                        </Group>
                        <Group>
                          <Text><b>Kolo úlohy:</b> {Math.floor(savedGame.board.reduce((acc, row) => acc + row.filter((cell) => cell !== "").length, 0) / 2)}</Text>
                        </Group>
                        <Title order={3}>Upravit úlohu</Title>
                        <form onSubmit={editPuzzleForm.onSubmit((values) => editPuzzleSubmit(values))}>
                          <TextInput
                            required
                            label="Název"
                            placeholder="Úloha"
                            key={editPuzzleForm.key('name')}
                            {...editPuzzleForm.getInputProps('name')}
                          />

                          <IconSelect 
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
                            required
                            data={[
                              { value: 'beginner', label: 'začátečník' },
                              { value: 'easy', label: 'jednoduchá' },
                              { value: 'medium', label: 'pokročilá' },
                              { value: 'hard', label: 'těžká' },
                              { value: 'extreme', label: 'nejtežší' },
                            ]} 
                            key={editPuzzleForm.key('difficulty')}
                            {...editPuzzleForm.getInputProps('difficulty')}
                          />

                          <Group justify="flex-end" mt="md">
                            <Button type="submit" disabled={gameResult.finished}>Upravit</Button>
                          </Group>
                          
                        </form>
                        <Button color="red" onClick={deletePuzzle}>Smazat úlohu</Button>
                      </Stack>}
                        
                    </Tabs.Panel>
                  </Tabs>
                </Paper>
            </Flex>
          </Center>
      </MainLayout>
    </>
  );
}
