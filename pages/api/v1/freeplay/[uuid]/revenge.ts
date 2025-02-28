import type { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { methodRouter } from "../../../../../lib/methodRouter" // Adjust path accordingly
import { connectToDatabase } from "../../../../../lib/db"
import Freeplay from "../../../../../models/FreePlay"
import { getOnTurn, checkGameEnd } from "../../../../../lib/tictactoe"
import type { IronSession } from "iron-session"
import type { NextApiResponseWithSocket, SocketWithData } from "../../../../../pages/api/socket"
import { createEmptyBoard } from "../../../../../lib/tictactoe"

// PUT handler
const handlePost = async (req: NextApiRequest, res: NextApiResponseWithSocket, data: unknown, session: IronSession<SessionData>) => {
  await connectToDatabase()

  const freeplay = await Freeplay.findOne({ uuid: req.query.uuid })
  if (!freeplay) {
    return res.status(404).json({
      code: 404,
      message: "Resource not found",
    } as errorMessage)
  }

  if (!freeplay.opponentSessionId) {
    return res.status(403).json({
      code: 403,
      message: "Game hasnt started yet",
    } as errorMessage)
  }

  if (freeplay.creatorSessionId !== session.uuid && freeplay.opponentSessionId !== session.uuid) {
    return res.status(403).json({
      code: 403,
      message: "Forbidden",
    } as errorMessage)
  }

  if (!freeplay.finished) {
    return res.status(403).json({
      code: 403,
      message: "Game is not finished",
    } as errorMessage)
  }

  const isCreator = freeplay.creatorSessionId === session.uuid

  if (isCreator) {
    freeplay.creatorRevenge = true
  } else {
    freeplay.opponentRevenge = true
  }

  if (freeplay.creatorRevenge && freeplay.opponentRevenge) {
    freeplay.creatorPoints = 8 * 60
    freeplay.opponentPoints = 8 * 60
    freeplay.startedAt = Date.now()
    freeplay.lastMoveAt = Date.now()
    freeplay.creatorStarts = randomBoolean()
    freeplay.lastMoveX = -1
    freeplay.lastMoveY = -1
    freeplay.board = createEmptyBoard()
    freeplay.creatorRevenge = false
    freeplay.opponentRevenge = false
    freeplay.finished = false
  }

  try {
    await freeplay.save()

    const io = res.socket.server.io
    if (io) {
      io.sockets.sockets.forEach((socket: SocketWithData) => {
        if (socket.sessionUUID === freeplay.creatorSessionId || socket.sessionUUID === freeplay.opponentSessionId) {
          socket.emit(`freeplayUpdate:${freeplay.uuid}`, freeplay)
        }
      })
    }

    res.status(200).json(freeplay)
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
