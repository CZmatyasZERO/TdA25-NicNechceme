import type { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { methodRouter } from "../../../../lib/methodRouter" // Adjust path accordingly
import { connectToDatabase } from "../../../../lib/db"
import FreePlay from "../../../../models/FreePlay"
import { getOnTurn, checkGameEnd } from "../../../../lib/tictactoe"
import type { IronSession } from "iron-session"
import type { NextApiResponseWithSocket, SocketWithData } from "../../../../pages/api/socket"

const putBodySchema = z
  .object({
    x: z.number().min(0, "X coordinate must be greater than or equal to 0").max(14, "X coordinate must be less than or equal to 14"),
    y: z.number().min(0, "Y coordinate must be greater than or equal to 0").max(14, "Y coordinate must be less than or equal to 14"),
  })
  .strict() // Ensure all properties are present

// Define the types based on the schemas
type PutBodyType = z.infer<typeof putBodySchema>

// GET handler
const handleGet = async (req: NextApiRequest, res: NextApiResponseWithSocket, data: unknown, session: IronSession<SessionData>) => {
  await connectToDatabase()

  const freePlay = await FreePlay.findOne({ uuid: req.query.uuid })
  if (!freePlay) {
    return res.status(404).json({
      code: 404,
      message: "Resource not found",
    } as errorMessage)
  }

  if (freePlay.creatorSessionId !== session.uuid && freePlay.opponentSessionId !== session.uuid) {
    return res.status(403).json({
      code: 403,
      message: "Forbidden",
    } as errorMessage)
  }

  let edited = false

  if (freePlay.creatorTimeLeft === 0) {
    freePlay.creatorPoints = 0
    freePlay.finished = true
    freePlay.save()
    edited = true
  } else if (freePlay.opponentTimeLeft === 0) {
    freePlay.opponentPoints = 0
    freePlay.finished = true
    freePlay.save()
    edited = true
  } else if (!freePlay.finished) {
    let gameResult = checkGameEnd(freePlay.board)
    if (gameResult.finished) {
      freePlay.finished = true
      freePlay.save()
      edited = true
    }
  }

  if (edited) {
    const io = res.socket.server.io
    if (io) {
      io.sockets.sockets.forEach((socket: SocketWithData) => {
        if (socket.sessionUUID === freePlay.creatorSessionId || socket.sessionUUID === freePlay.opponentSessionId) {
          socket.emit(`freePlayUpdate:${freePlay.uuid}`, freePlay)
        }
      })
    }
  }

  res.status(200).json(freePlay)
}

// PUT handler
const handlePut = async (req: NextApiRequest, res: NextApiResponseWithSocket, data: PutBodyType, session: IronSession<SessionData>) => {
  await connectToDatabase()

  const freePlay = await FreePlay.findOne({ uuid: req.query.uuid })
  if (!freePlay) {
    return res.status(404).json({
      code: 404,
      message: "Resource not found",
    } as errorMessage)
  }

  if (!freePlay.opponentSessionId) {
    return res.status(403).json({
      code: 403,
      message: "Game hasnt started yet",
    } as errorMessage)
  }

  if (freePlay.creatorSessionId !== session.uuid && freePlay.opponentSessionId !== session.uuid) {
    return res.status(403).json({
      code: 403,
      message: "Forbidden",
    } as errorMessage)
  }

  if (freePlay.finished) {
    return res.status(403).json({
      code: 403,
      message: "Game is finished",
    } as errorMessage)
  }

  const isCreator = freePlay.creatorSessionId === session.uuid

  const player = isCreator ? (freePlay.creatorStarts ? "X" : "O") : freePlay.creatorStarts ? "O" : "X"

  const onTurn = getOnTurn(freePlay.board)

  if (onTurn !== player) {
    return res.status(403).json({
      code: 403,
      message: "It's not your turn",
    } as errorMessage)
  }

  if (freePlay.board[data.x][data.y] !== "") {
    return res.status(403).json({
      code: 403,
      message: "Cell is already occupied",
    } as errorMessage)
  }

  freePlay.lastMoveX = data.x
  freePlay.lastMoveY = data.y
  freePlay.creatorPoints = freePlay.creatorTimeLeft
  freePlay.opponentPoints = freePlay.opponentTimeLeft
  freePlay.board[data.x][data.y] = player
  freePlay.lastMoveAt = new Date()

  if (freePlay.creatorPoints === 0 || freePlay.opponentPoints === 0) {
    freePlay.finished = true
  }

  let gameResult = checkGameEnd(freePlay.board)
  if (gameResult.finished) {
    freePlay.finished = true
  }
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

const handleDelete = async (req: NextApiRequest, res: NextApiResponseWithSocket, data: unknown, session: IronSession<SessionData>) => {
  await connectToDatabase()
  const freePlay = await FreePlay.findOne({ uuid: req.query.uuid })
  if (!freePlay) {
    return res.status(404).json({
      code: 404,
      message: "Resource not found",
    } as errorMessage)
  }

  if (freePlay.creatorSessionId !== session.uuid && freePlay.opponentSessionId !== session.uuid) {
    return res.status(403).json({
      code: 403,
      message: "Forbidden",
    } as errorMessage)
  }

  if (freePlay.finished) {
    return res.status(403).json({
      code: 403,
      message: "Game is finished",
    } as errorMessage)
  }

  const iAmCreator = freePlay.creatorSessionId === session.uuid
  if (iAmCreator) {
    freePlay.creatorPoints = 0
  } else {
    freePlay.opponentPoints = 0
  }
  freePlay.finished = true
  await freePlay.save()

  const io = res.socket.server.io
  if (io) {
    io.sockets.sockets.forEach((socket: SocketWithData) => {
      if (socket.sessionUUID === freePlay.creatorSessionId || socket.sessionUUID === freePlay.opponentSessionId) {
        socket.emit(`freePlayUpdate:${freePlay.uuid}`, freePlay)
      }
    })
  }

  return res.status(200).json({
    code: 200,
    message: "Successfully gave up",
  })
}

// Export the API route
export default methodRouter({
  GET: { handler: handleGet },
  PUT: { handler: handlePut, schema: putBodySchema },
  DELETE: { handler: handleDelete },
})
