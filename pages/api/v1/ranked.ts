import type { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { methodRouter } from "../../../lib/methodRouter"
import { connectToDatabase } from "../../../lib/db"
import type { IronSession } from "iron-session"
import Ranked from "../../../models/Ranked"
import User from "../../../models/User"
import { getGlobalVar, setGlobalVar } from "../../../lib/global"
import type { NextApiResponseWithSocket, SocketWithData } from "../socket"

// POST handler
const handlePost = async (req: NextApiRequest, res: NextApiResponse, data: unknown, session: IronSession<SessionData>) => {
  await connectToDatabase()

  if (!session.loggedIn) {
    return res.status(401).json({ code: 401, message: "You must be logged in to create a free play." })
  }

  const user = await User.findOne({ uuid: session.uuid })
  if (!user) {
    return res.status(404).json({ code: 404, message: "User not found" })
  }

  if (user.banned) {
    return res.status(208).json({ code: 208, message: "You are banned" })
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

  user.findingRanked = true
  try {
    await user.save()
    res.status(201).json({ code: 201, message: "Joined searching" })
  } catch (error: any) {
    res.status(422).json({ code: 422, message: error.message })
  }
}

const handleDelete = async (req: NextApiRequest, res: NextApiResponse, data: unknown, session: IronSession<SessionData>) => {
  await connectToDatabase()

  if (!session.loggedIn) {
    return res.status(401).json({ code: 401, message: "You must be logged in to create a free play." })
  }

  const user = await User.findOne({ uuid: session.uuid })
  if (!user) {
    return res.status(404).json({ code: 404, message: "User not found" })
  }

  user.findingRanked = false
  try {
    await user.save()
    res.status(200).json({ code: 200, message: "Successfully stopped searching for game" })
  } catch (error: any) {
    res.status(422).json({ code: 422, message: error.message })
  }
}

// Trying to find opponents for ranked (only every 5 seconds)
const handleGet = async (req: NextApiRequest, res: NextApiResponse, data: unknown, session: IronSession<SessionData>) => {
  await connectToDatabase()

  // apply if it was 5 seconds since last time checked
  if (getGlobalVar("lastTimeCheckedRanked") < Date.now() - 5000) {
    setGlobalVar("lastTimeCheckedRanked", Date.now())
    const user = await User.find({ findingRanked: true })
    if (user.length > 1) {
      const sortedUsers = user.sort((a, b) => a.elo - b.elo)
      // make array of tuples of two users
      const pairs = []
      for (let i = 0; i < sortedUsers.length - 1; i += 2) {
        pairs.push([sortedUsers[i], sortedUsers[i + 1]])
      }

      pairs.forEach(async (pair) => {
        const creator = pair[0]
        const opponent = pair[1]
        creator.findingRanked = false
        opponent.findingRanked = false
        const ranked = new Ranked({
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
          await Promise.all([ranked.save(), creator.save(), opponent.save()])
        } catch (error: any) {
        }
      })
    }
    return res.status(201).json({
      code: 201,
      message: "task completed",
    })
  }

  return res.status(200).json({
    code: 200,
    message: "not this time",
  })
}

// Export the API route
export default methodRouter({
  POST: { handler: handlePost },
  GET: { handler: handleGet },
  DELETE: { handler: handleDelete },
})
