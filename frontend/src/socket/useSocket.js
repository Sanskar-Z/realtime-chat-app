import { useEffect } from "react"
import socket from "./socket"

const useSocket = () => {
  useEffect(() => {
    const onConnect = () => {
      console.log("Socket connected:", socket.id)
    }

    const onDisconnect = () => {
      console.log("Socket disconnected")
    }

    const onError = (err) => {
      console.error("Socket error:", err)
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("connect_error", onError)

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("connect_error", onError)
    }
  }, [])
}

export default useSocket
