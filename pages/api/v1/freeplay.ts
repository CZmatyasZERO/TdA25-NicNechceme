import type { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { methodRouter } from "../../../lib/methodRouter"
import { connectToDatabase } from "../../../lib/db"
import type { IronSession } from "iron-session"
import FreePlay from "../../../models/FreePlay"

// POST handler
const handlePost = async (req: NextApiRequest, res: NextApiResponse, data: unknown, session: IronSession<SessionData>) => {
  await connectToDatabase()

  if (!session.loggedIn) {
    return res.status(401).json({ code: 401, message: "You must be logged in to create a free play." })
  }

  const freePlay = new FreePlay({
    creatorSessionId: session.uuid,
  })
  try {
    await freePlay.save()
    res.status(201).json(freePlay)
  } catch (error: any) {
    res.status(422).json({ code: 422, message: error.message })
  }
}

// Export the API route
export default methodRouter({
  POST: { handler: handlePost },
})
