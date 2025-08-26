import {useEffect, useState} from "react";
import {io} from "socket.io-client";


function Test() {

    const [message, setMessage] = useState<string>('');

    useEffect(() =>{
        fetch("http://localhost:3000/test")
            .then((res) => res.text())
            .then((data) => setMessage(data))

        const newSocket = io("http://localhost:3000");

        newSocket.on('connect', () => {
            console.log('Connecté au socket:', newSocket.id);
        });

        newSocket.on('testMessage', (message) =>{
            console.log(message);
        })
    }, [])

  return (
    <>
      <h1>Voici un test du router</h1>
      <p>Ça marche bien !</p>
        <p>message = {message}</p>
    </>
  )

}

export default Test