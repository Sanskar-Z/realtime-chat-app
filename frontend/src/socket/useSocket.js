import { useEffect } from 'react'
import socket from './socket'

const useSocket = () => {
    useEffect(() => {
        socket.connect();

        socket.on('connect', () => {
            console.log("User connected ID:", socket.id);
        })
    
      return () => {
        socket.off("connect");
        socket.disconnect();
      }
    }, [])
    

  return socket;
}

export default useSocket;
