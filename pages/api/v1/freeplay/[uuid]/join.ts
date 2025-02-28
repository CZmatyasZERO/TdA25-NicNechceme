import type { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { methodRouter } from "../../../../../lib/methodRouter" // Adjust path accordingly
import { connectToDatabase } from "../../../../../lib/db"
import FreePlay from "../../../../../models/FreePlay"
import { getOnTurn, checkGameEnd } from "../../../../../lib/tictactoe"
import type { IronSession } from "iron-session"
import type { NextApiResponseWithSocket, SocketWithData } from "../../../../../pages/api/socket"
import { createEmptyBoard } from "../../../../../lib/tictactoe"

// PUT handler
const handlePost = async (req: NextApiRequest, res: NextApiResponseWithSocket, data: unknown, session: IronSession<SessionData>) => {
  await connectToDatabase()

  const freePlay = await FreePlay.findOne({ uuid: req.query.uuid })
  if (!freePlay) {
    return res.status(404).json({
      code: 404,
      message: "Resource not found",
    } as errorMessage)
  }

  if (freePlay.opponentSessionId) {
    return res.status(403).json({
      code: 403,
      message: "Game has started",
    } as errorMessage)
  }

  if (freePlay.creatorSessionId == session.uuid) {
    return res.status(403).json({
      code: 403,
      message: "You are already the creator",
    } as errorMessage)
  }

  freePlay.opponentSessionId = session.uuid
  freePlay.startedAt = Date.now()
  freePlay.lastMoveAt = Date.now()

  try {
    await freePlay.save()

    const io = res.socket.server.io
    if (io) {
      io.sockets.sockets.forEach((socket: SocketWithData) => {
        if (socket.sessionUUID === freePlay.creatorSessionId || socket.sessionUUID === freePlay.opponentSessionId) {
          socket.emit(`freePlayUpdate:${freePlay.uuid}`, freePlay)
        }
      })
    }

    res.status(200).json(freePlay)
  } catch (error: any) {
    res.status(422).json({ code: 422, message: error.message } as errorMessage)
  }
}

// Export the API route
export default methodRouter({
  POST: { handler: handlePost },
})
