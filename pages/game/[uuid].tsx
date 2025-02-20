import { connectToDatabase } from "../../lib/db"
import Game from "../../models/Game"
import { GetServerSidePropsContext } from "next"
import { GamePage } from "../game"

export async function getServerSideProps(context: GetServerSidePropsContext) {
  await connectToDatabase()

  const game = await Game.findOne({ uuid: context?.params?.uuid })
  if (!game) {
    return { notFound: true }
  }

  return { props: { savedGame: JSON.parse(JSON.stringify(game)) } }
}

export default function LoadedGamePage({
  savedGame,
}: {
  savedGame?: {
    board: Board
    name: string
    difficulty: "beginner" | "easy" | "medium" | "hard" | "extreme"
    uuid: string
  }
}) {
  return <GamePage savedGame={savedGame} />
}
