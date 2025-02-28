import type { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { methodRouter } from "../../../../../lib/methodRouter" // Adjust path accordingly
import { connectToDatabase } from "../../../../../lib/db"
import Ranked from "../../../../../models/Ranked"
import type { IronSession } from "iron-session"
import type { NextApiResponseWithSocket, SocketWithData } from "../../../socket"
import { createEmptyBoard } from "../../../../../lib/tictactoe"
import User from "../../../../../models/User"

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

  if (ranked.revenged) {
    return res.status(200).json({ code: 200, message: "Already revenged" })
  }

  if (ranked.creatorRevenge && ranked.opponentRevenge) {
    ranked.revenged = true
    const creator = await User.findOne({ uuid: ranked.creatorSessionId })
    const opponent = await User.findOne({ uuid: ranked.opponentSessionId })
    const newRanked = new Ranked({
      creatorSessionId: creator.uuid,
      opponentSessionId: opponent.uuid,
      creatorELO: creator.elo,
      opponentELO: opponent.elo,
      creatorWins: creator.wins,
      opponentWins: opponent.wins,
      creatorLosses: creator.losses,
      opponentLosses: opponent.losses,
      creatorDraws: creator.draws,
      opponentDraws: opponent.draws,
      startedAt: Date.now(),
      lastMoveAt: Date.now(),
    })
    try {
      await Promise.all([newRanked.save(), creator.save(), opponent.save()])
    } catch (error: any) {
    }
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

const handleGet = async (req: NextApiRequest, res: NextApiResponse, data: unknown, session: IronSession<SessionData>) => {
  await connectToDatabase()

  if (!session.loggedIn) {
    return res.status(401).json({ code: 401, message: "You must be logged in to create a free play." })
  }

  const user = await User.findOne({ uuid: session.uuid })
  if (!user) {
    return res.status(404).json({ code: 404, message: "User not found" })
  }

  if (user.findingRanked) {
    return res.status(202).json({ code: 203, message: "You are already searching for a game" })
  }

  const ranked = await Ranked.findOne({
    $or: [{ creatorSessionId: session.uuid }, { opponentSessionId: session.uuid }],
    finished: false,
  })

  if (ranked) {
    return res.status(203).json({ uuid: ranked.uuid })
  }

  try {
    await user.save()
    res.status(201).json({ code: 201, message: "Still nothing" })
  } catch (error: any) {
    res.status(422).json({ code: 422, message: error.message })
  }
}

function randomBoolean() {
  return Math.random() >= 0.5
}

// Export the API route
export default methodRouter({
  POST: { handler: handlePost },
  GET: { handler: handleGet },
})
