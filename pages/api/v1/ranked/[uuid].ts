import type { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { methodRouter } from "../../../../lib/methodRouter" // Adjust path accordingly
import { connectToDatabase } from "../../../../lib/db"
import Ranked from "../../../../models/Ranked"
import { getOnTurn, checkGameEnd } from "../../../../lib/tictactoe"
import type { IronSession } from "iron-session"
import type { NextApiResponseWithSocket, SocketWithData } from "../../socket"
import User from "../../../../models/User"
import { getELOChanges } from "../../../../lib/elo"

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

  let edited = false

  const CreatorPlayer = ranked.creatorStarts ? "X" : "O"

  if (ranked.creatorTimeLeft === 0) {
    ranked.creatorPoints = 0
    ranked.finished = true
    const creator = await User.findOne({ uuid: ranked.creatorSessionId })
    const opponent = await User.findOne({ uuid: ranked.opponentSessionId })

    const creatorChanges = getELOChanges(
      {
        elo: creator.elo,
        wins: creator.wins,
        losses: creator.losses,
        draws: creator.draws,
      },
      {
        elo: opponent.elo,
        wins: opponent.wins,
        losses: opponent.losses,
        draws: opponent.draws,
      },
    )

    const opponentChanges = getELOChanges(
      {
        elo: opponent.elo,
        wins: opponent.wins,
        losses: opponent.losses,
        draws: opponent.draws,
      },
      {
        elo: creator.elo,
        wins: creator.wins,
        losses: creator.losses,
        draws: creator.draws,
      },
    )

    creator.elo = creator.elo + creatorChanges.lose
    opponent.elo = opponent.elo + opponentChanges.win
    creator.losses = creator.losses + 1
    opponent.wins = opponent.wins + 1
    await Promise.all([creator.save(), opponent.save()])

    ranked.save()
    edited = true
  } else if (ranked.opponentTimeLeft === 0) {
    ranked.opponentPoints = 0
    ranked.finished = true
    ranked.save()

    ranked.creatorPoints = 0
    ranked.finished = true
    const creator = await User.findOne({ uuid: ranked.creatorSessionId })
    const opponent = await User.findOne({ uuid: ranked.opponentSessionId })

    const creatorChanges = getELOChanges(
      {
        elo: creator.elo,
        wins: creator.wins,
        losses: creator.losses,
        draws: creator.draws,
      },
      {
        elo: opponent.elo,
        wins: opponent.wins,
        losses: opponent.losses,
        draws: opponent.draws,
      },
    )

    const opponentChanges = getELOChanges(
      {
        elo: opponent.elo,
        wins: opponent.wins,
        losses: opponent.losses,
        draws: opponent.draws,
      },
      {
        elo: creator.elo,
        wins: creator.wins,
        losses: creator.losses,
        draws: creator.draws,
      },
    )

    creator.elo = creator.elo + creatorChanges.win
    opponent.elo = opponent.elo + opponentChanges.lose
    creator.wins = creator.wins + 1
    opponent.losses = opponent.losses + 1
    await Promise.all([creator.save(), opponent.save()])
    edited = true
  } else if (!ranked.finished) {
    let gameResult = checkGameEnd(ranked.board)
    if (gameResult.finished) {
      const creator = await User.findOne({ uuid: ranked.creatorSessionId })
      const opponent = await User.findOne({ uuid: ranked.opponentSessionId })
      const creatorChanges = getELOChanges(
        {
          elo: creator.elo,
          wins: creator.wins,
          losses: creator.losses,
          draws: creator.draws,
        },
        {
          elo: opponent.elo,
          wins: opponent.wins,
          losses: opponent.losses,
          draws: opponent.draws,
        },
      )

      const opponentChanges = getELOChanges(
        {
          elo: opponent.elo,
          wins: opponent.wins,
          losses: opponent.losses,
          draws: opponent.draws,
        },
        {
          elo: creator.elo,
          wins: creator.wins,
          losses: creator.losses,
          draws: creator.draws,
        },
      )
      switch (gameResult.winner) {
        case "X":
          if (CreatorPlayer === "X") {
            creator.elo = creator.elo + creatorChanges.win
            opponent.elo = opponent.elo + opponentChanges.lose
            creator.wins = creator.wins + 1
            opponent.losses = opponent.losses + 1
          } else {
            creator.elo = creator.elo + creatorChanges.lose
            opponent.elo = opponent.elo + opponentChanges.win
            creator.losses = creator.losses + 1
            opponent.wins = opponent.wins + 1
          }

          break
        case "O":
          if (CreatorPlayer === "X") {
            creator.elo = creator.elo + creatorChanges.lose
            opponent.elo = opponent.elo + opponentChanges.win
            creator.losses = creator.losses + 1
            opponent.wins = opponent.wins + 1
          } else {
            creator.elo = creator.elo + creatorChanges.win
            opponent.elo = opponent.elo + opponentChanges.lose
            creator.wins = creator.wins + 1
            opponent.losses = opponent.losses + 1
          }

          break
        case undefined:
          creator.elo = creator.elo + creatorChanges.draw
          opponent.elo = opponent.elo + opponentChanges.draw
          creator.draws = creator.draws + 1
          opponent.draws = opponent.draws + 1

          break
      }
      await Promise.all([creator.save(), opponent.save()])
      ranked.finished = true
      ranked.save()
      edited = true
    }
  }

  if (edited) {
    const io = res.socket.server.io
    if (io) {
      io.sockets.sockets.forEach((socket: SocketWithData) => {
        if (socket.sessionUUID === ranked.creatorSessionId || socket.sessionUUID === ranked.opponentSessionId) {
          socket.emit(`rankedUpdate:${ranked.uuid}`, ranked)
        }
      })
    }
  }

  res.status(200).json(ranked)
}

// PUT handler
const handlePut = async (req: NextApiRequest, res: NextApiResponseWithSocket, data: PutBodyType, session: IronSession<SessionData>) => {
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

  if (ranked.finished) {
    return res.status(403).json({
      code: 403,
      message: "Game is finished",
    } as errorMessage)
  }

  const isCreator = ranked.creatorSessionId === session.uuid

  const player = isCreator ? (ranked.creatorStarts ? "X" : "O") : ranked.creatorStarts ? "O" : "X"

  const onTurn = getOnTurn(ranked.board)

  if (onTurn !== player) {
    return res.status(403).json({
      code: 403,
      message: "It's not your turn",
    } as errorMessage)
  }

  if (ranked.board[data.x][data.y] !== "") {
    return res.status(403).json({
      code: 403,
      message: "Cell is already occupied",
    } as errorMessage)
  }

  ranked.lastMoveX = data.x
  ranked.lastMoveY = data.y
  ranked.creatorPoints = ranked.creatorTimeLeft
  ranked.opponentPoints = ranked.opponentTimeLeft
  ranked.board[data.x][data.y] = player
  ranked.lastMoveAt = new Date()

  const CreatorPlayer = ranked.creatorStarts ? "X" : "O"

  if (ranked.creatorPoints === 0) {
    ranked.creatorPoints = 0
    ranked.finished = true
    const creator = await User.findOne({ uuid: ranked.creatorSessionId })
    const opponent = await User.findOne({ uuid: ranked.opponentSessionId })

    const creatorChanges = getELOChanges(
      {
        elo: creator.elo,
        wins: creator.wins,
        losses: creator.losses,
        draws: creator.draws,
      },
      {
        elo: opponent.elo,
        wins: opponent.wins,
        losses: opponent.losses,
        draws: opponent.draws,
      },
    )

    const opponentChanges = getELOChanges(
      {
        elo: opponent.elo,
        wins: opponent.wins,
        losses: opponent.losses,
        draws: opponent.draws,
      },
      {
        elo: creator.elo,
        wins: creator.wins,
        losses: creator.losses,
        draws: creator.draws,
      },
    )

    creator.elo = creator.elo + creatorChanges.lose
    opponent.elo = opponent.elo + opponentChanges.win
    creator.losses = creator.losses + 1
    opponent.wins = opponent.wins + 1
    await Promise.all([creator.save(), opponent.save()])

    ranked.save()
  } else if (ranked.opponentPoints === 0) {
    ranked.opponentPoints = 0
    ranked.finished = true
    ranked.save()

    ranked.creatorPoints = 0
    ranked.finished = true
    const creator = await User.findOne({ uuid: ranked.creatorSessionId })
    const opponent = await User.findOne({ uuid: ranked.opponentSessionId })

    const creatorChanges = getELOChanges(
      {
        elo: creator.elo,
        wins: creator.wins,
        losses: creator.losses,
        draws: creator.draws,
      },
      {
        elo: opponent.elo,
        wins: opponent.wins,
        losses: opponent.losses,
        draws: opponent.draws,
      },
    )

    const opponentChanges = getELOChanges(
      {
        elo: opponent.elo,
        wins: opponent.wins,
        losses: opponent.losses,
        draws: opponent.draws,
      },
      {
        elo: creator.elo,
        wins: creator.wins,
        losses: creator.losses,
        draws: creator.draws,
      },
    )

    creator.elo = creator.elo + creatorChanges.win
    opponent.elo = opponent.elo + opponentChanges.lose
    creator.wins = creator.wins + 1
    opponent.losses = opponent.losses + 1
    await Promise.all([creator.save(), opponent.save()])
  } else if (!ranked.finished) {
    let gameResult = checkGameEnd(ranked.board)
    if (gameResult.finished) {
      const creator = await User.findOne({ uuid: ranked.creatorSessionId })
      const opponent = await User.findOne({ uuid: ranked.opponentSessionId })
      const creatorChanges = getELOChanges(
        {
          elo: creator.elo,
          wins: creator.wins,
          losses: creator.losses,
          draws: creator.draws,
        },
        {
          elo: opponent.elo,
          wins: opponent.wins,
          losses: opponent.losses,
          draws: opponent.draws,
        },
      )

      const opponentChanges = getELOChanges(
        {
          elo: opponent.elo,
          wins: opponent.wins,
          losses: opponent.losses,
          draws: opponent.draws,
        },
        {
          elo: creator.elo,
          wins: creator.wins,
          losses: creator.losses,
          draws: creator.draws,
        },
      )
      switch (gameResult.winner) {
        case "X":
          if (CreatorPlayer === "X") {
            creator.elo = creator.elo + creatorChanges.win
            opponent.elo = opponent.elo + opponentChanges.lose
            creator.wins = creator.wins + 1
            opponent.losses = opponent.losses + 1
          } else {
            creator.elo = creator.elo + creatorChanges.lose
            opponent.elo = opponent.elo + opponentChanges.win
            creator.losses = creator.losses + 1
            opponent.wins = opponent.wins + 1
          }

          break
        case "O":
          if (CreatorPlayer === "X") {
            creator.elo = creator.elo + creatorChanges.lose
            opponent.elo = opponent.elo + opponentChanges.win
            creator.losses = creator.losses + 1
            opponent.wins = opponent.wins + 1
          } else {
            creator.elo = creator.elo + creatorChanges.win
            opponent.elo = opponent.elo + opponentChanges.lose
            creator.wins = creator.wins + 1
            opponent.losses = opponent.losses + 1
          }

          break
        case undefined:
          creator.elo = creator.elo + creatorChanges.draw
          opponent.elo = opponent.elo + opponentChanges.draw
          creator.draws = creator.draws + 1
          opponent.draws = opponent.draws + 1

          break
      }
      await Promise.all([creator.save(), opponent.save()])
      ranked.finished = true
      ranked.save()
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

const handleDelete = async (req: NextApiRequest, res: NextApiResponseWithSocket, data: unknown, session: IronSession<SessionData>) => {
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

  if (ranked.finished) {
    return res.status(403).json({
      code: 403,
      message: "Game is finished",
    } as errorMessage)
  }

  const creator = await User.findOne({ uuid: ranked.creatorSessionId })
  const opponent = await User.findOne({ uuid: ranked.opponentSessionId })

  const creatorChanges = getELOChanges(
    {
      elo: creator.elo,
      wins: creator.wins,
      losses: creator.losses,
      draws: creator.draws,
    },
    {
      elo: opponent.elo,
      wins: opponent.wins,
      losses: opponent.losses,
      draws: opponent.draws,
    },
  )

  const opponentChanges = getELOChanges(
    {
      elo: opponent.elo,
      wins: opponent.wins,
      losses: opponent.losses,
      draws: opponent.draws,
    },
    {
      elo: creator.elo,
      wins: creator.wins,
      losses: creator.losses,
      draws: creator.draws,
    },
  )

  const iAmCreator = ranked.creatorSessionId === session.uuid
  if (iAmCreator) {
    creator.elo = creator.elo + creatorChanges.lose
    opponent.elo = opponent.elo + opponentChanges.win
    creator.losses = creator.losses + 1
    opponent.wins = opponent.wins + 1
    ranked.creatorPoints = 0
  } else {
    creator.elo = creator.elo + creatorChanges.win
    opponent.elo = opponent.elo + opponentChanges.lose
    creator.wins = creator.wins + 1
    opponent.losses = opponent.losses + 1
    ranked.opponentPoints = 0
  }
  ranked.finished = true

  await Promise.all([creator.save(), opponent.save()])

  await ranked.save()

  const io = res.socket.server.io
  if (io) {
    io.sockets.sockets.forEach((socket: SocketWithData) => {
      if (socket.sessionUUID === ranked.creatorSessionId || socket.sessionUUID === ranked.opponentSessionId) {
        socket.emit(`rankedUpdate:${ranked.uuid}`, ranked)
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
