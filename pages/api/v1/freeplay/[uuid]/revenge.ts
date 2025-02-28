import type { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { methodRouter } from "../../../../../lib/methodRouter" // Adjust path accordingly
import { connectToDatabase } from "../../../../../lib/db"
import Ranked from "../../../../../models/Ranked"
import { getOnTurn, checkGameEnd } from "../../../../../lib/tictactoe"
import type { IronSession } from "iron-session"
import type { NextApiResponseWithSocket, SocketWithData } from "../../../../../pages/api/socket"
import { createEmptyBoard } from "../../../../../lib/tictactoe"

// PUT handler
const handlePost = async (req: NextApiRequest, res: NextApiResponseWithSocket, data: unknown, session: IronSession<SessionData>) => {
  await connectToDatabase()

  const ranked = await Ranked.findOne({ uuid: req.query.uuid })
  if (!ranked) {
    return res.status(404).json({
      code: 404,
      message: "Resource not found",
    } as errorMessage)
  }

  if (!ranked.opponentSessionId) {
    return res.status(403).json({
      code: 403,
      message: "Game hasnt started yet",
    } as errorMessage)
  }

  if (ranked.creatorSessionId !== session.uuid && ranked.opponentSessionId !== session.uuid) {
    return res.status(403).json({
      code: 403,
      message: "Forbidden",
    } as errorMessage)
  }

  if (!ranked.finished) {
    return res.status(403).json({
      code: 403,
      message: "Game is not finished",
    } as errorMessage)
  }

  const isCreator = ranked.creatorSessionId === session.uuid

  if (isCreator) {
    ranked.creatorRevenge = true
  } else {
    ranked.opponentRevenge = true
  }

  if (ranked.creatorRevenge && ranked.opponentRevenge) {
    ranked.creatorPoints = 8 * 60
    ranked.opponentPoints = 8 * 60
    ranked.startedAt = Date.now()
    ranked.lastMoveAt = Date.now()
    ranked.creatorStarts = randomBoolean()
    ranked.lastMoveX = -1
    ranked.lastMoveY = -1
    ranked.board = createEmptyBoard()
    ranked.creatorRevenge = false
    ranked.opponentRevenge = false
    ranked.finished = false
  }

  try {
    await ranked.save()

    const io = res.socket.server.io
    if (io) {
      io.sockets.sockets.forEach((socket: SocketWithData) => {
        if (socket.sessionUUID === ranked.creatorSessionId || socket.sessionUUID === ranked.opponentSessionId) {
          socket.emit(`rankedUpdate:${ranked.uuid}`, ranked)
        }
      })
    }

    res.status(200).json(ranked)
  } catch (error: any) {
    res.status(422).json({ code: 422, message: error.message } as errorMessage)
  }
}

function randomBoolean() {
  return Math.random() >= 0.5
}

// Export the API route
export default methodRouter({
  POST: { handler: handlePost },
})
