import type { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { methodRouter } from "../../../lib/methodRouter"
import { connectToDatabase } from "../../../lib/db"
import type { IronSession } from "iron-session"
import GuestPlay from "../../../models/GuestPlay"



// POST handler
const handlePost = async (req: NextApiRequest, res: NextApiResponse, data: unknown, session: IronSession<SessionData>) => {
  await connectToDatabase()
  const guestPlay = new GuestPlay({
    creatorSessionId: session.uuid
  })
  try {
    await guestPlay.save()
    res.status(201).json(guestPlay)
  } catch (error: any) {
    res.status(422).json({ code: 422, message: error.message })
  }
}

// Export the API route
export default methodRouter({
  POST: { handler: handlePost },
})
