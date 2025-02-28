import { Server } from "socket.io"
import type { Server as HTTPServer } from "http"
import type { Socket as NetSocket } from "net"
import type { NextApiRequest, NextApiResponse } from "next"
import type { Server as IOServer, Socket as IOSocket } from "socket.io"

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined
}

export interface SocketWithIO extends NetSocket {
  server: SocketServer
}

export interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO
  socketIO: IOServer
}

export interface SocketWithData extends IOSocket {
  sessionUUID?: string
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server)
    // Middleware to authenticate sockets
    io.use((socket: SocketWithData, next) => {
      const sessionUUID = socket.handshake.query.uuid // Pass session UUID as query parameter
      if (sessionUUID) {
        socket.sessionUUID = String(sessionUUID)
      }
      next()
    })

    res.socket.server.io = io
    res.socketIO = io
  }
  res.end()
}

export default SocketHandler
