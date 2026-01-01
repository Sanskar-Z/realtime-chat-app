import { useEffect } from 'react'
import socket from './socket'

const useSocket = () => {

    useEffect(() => {
        socket.connect();

        socket.on('connect', () => {
            console.log("User connected ID:", socket.id);
        })

        socket.on("receive-message", (data) => {
            console.log(data)
        })

  
      return () => {
        socket.off("connect");
        socket.disconnect();
      }
    }, [])


  return socket;
}

export default useSocket;
