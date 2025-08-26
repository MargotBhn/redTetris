import {useEffect, useState} from "react";


function Test() {

    const [message, setMessage] = useState<string>('');

    useEffect(() =>{
        fetch("http://localhost:3000/test")
            .then((res) => res.text())
            .then((data) => setMessage(data))
    })


  return (
    <>
      <h1>Voici un test du router</h1>
      <p>Ça marche bien !</p>
        <p>message = {message}</p>
    </>
  )

}

export default Test