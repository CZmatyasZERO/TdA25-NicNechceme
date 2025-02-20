import type { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { methodRouter } from "../../../../lib/methodRouter" // Adjust path accordingly
import { connectToDatabase } from "../../../../lib/db"
import GuestPlay from "../../../../models/GuestPlay"
import { getOnTurn } from "../../../../lib/tictactoe"
import type { IronSession } from "iron-session"

// Validation schema for PUT body
const boardSchema = z.array(z.array(z.string()))
const difficultySchema = z.union([z.literal("beginner"), z.literal("easy"), z.literal("medium"), z.literal("hard"), z.literal("extreme")])

const putBodySchema = z
  .object({
    x: z.number().min(0, "X coordinate must be greater than or equal to 0").max(14, "X coordinate must be less than or equal to 14"),
    y: z.number().min(0, "Y coordinate must be greater than or equal to 0").max(14, "Y coordinate must be less than or equal to 14"),
  })
  .strict() // Ensure all properties are present

// Define the types based on the schemas
type PutBodyType = z.infer<typeof putBodySchema>

// GET handler
const handleGet = async (req: NextApiRequest, res: NextApiResponse, data: unknown, session: IronSession<SessionData>) => {
  await connectToDatabase()

  const guestPlay = await GuestPlay.findOne({ uuid: req.query.uuid })
  if (!guestPlay) {
    return res.status(404).json({
      code: 404,
      message: "Resource not found",
    } as errorMessage)
  }

  if (guestPlay.creatorSessionId !== session.uuid || guestPlay.opponentSessionId !== session.uuid) {
    return res.status(403).json({
      code: 403,
      message: "Forbidden",
    } as errorMessage)
  }

  res.status(200).json(guestPlay)
}

// PUT handler
const handlePut = async (req: NextApiRequest, res: NextApiResponse, data: PutBodyType, session: IronSession<SessionData>) => {
  await connectToDatabase()

  const guestPlay = await GuestPlay.findOne({ uuid: req.query.uuid })
  if (!guestPlay) {
    return res.status(404).json({
      code: 404,
      message: "Resource not found",
    } as errorMessage)
  }

  if(!guestPlay.opponentSessionId) {
    return res.status(403).json({
      code: 403,
      message: "Game hasnt started yet",
    } as errorMessage)
  }

  if (guestPlay.creatorSessionId !== session.uuid || guestPlay.opponentSessionId !== session.uuid) {
    return res.status(403).json({
      code: 403,
      message: "Forbidden",
    } as errorMessage)
  }

  if(guestPlay.finished) {
    return res.status(403).json({
      code: 403,
      message: "Game is finished",
    } as errorMessage)
  }

  const isCreator = guestPlay.creatorSessionId === session.uuid

  const player = isCreator ? (guestPlay.creatorStarts ? "X" : "O") : (guestPlay.creatorStarts ? "O" : "X")

  const onTurn = getOnTurn(guestPlay.board)

  if (onTurn !== player) {
    return res.status(403).json({
      code: 403,
      message: "It's not your turn",
    } as errorMessage)
  }

  if(guestPlay.board[data.x][data.y] !== "") {
    return res.status(403).json({
      code: 403,
      message: "Cell is already occupied",
    } as errorMessage)
  }

  guestPlay.board[data.x][data.y] = player
  guestPlay.lastMoveX = data.x
  guestPlay.lastMoveY = data.y

  try {
    await guestPlay.save()
    res.status(200).json(guestPlay)
  } catch (error: any) {
    res.status(422).json({ code: 422, message: error.message } as errorMessage)
  }
}


// Export the API route
export default methodRouter({
  GET: { handler: handleGet },
  PUT: { handler: handlePut, schema: putBodySchema }
})
