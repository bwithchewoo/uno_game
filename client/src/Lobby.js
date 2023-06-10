import { useState } from 'react'
import {Link, useNavigate } from 'react-router-dom';
import plus from './assets/plus-sign.jpg'
import unknown from './assets/unknown.png'

function Lobby({ user, profilePicture, gameObject, setGameObject, singlePlayer, setSinglePlayer}) {
    const navigate = useNavigate()

    if (!gameObject?.id){
        navigate("/")
    }
 


    const deleteGame = (e) => {
        console.log(gameObject)
        if (gameObject?.id) {
            
            fetch(`/deletegame/${gameObject?.id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
                // Add any necessary request body or headers
                // body: JSON.stringify({ key: value }),
              })
              .then(() => {
                setGameObject(null)
              })
        }

    }

    const startGame = (e) => {
        if(gameObject?.id) {
            fetch("/startgame", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({game_id: gameObject.id}),
            })
            .then(response => response.json())
            .then(data => {
              setGameObject(data)
            })
        }
    }


    console.log('gameobj', gameObject)
    return (
        <div>
            <Link to="/">
                <button onClick={(e) => deleteGame(e)}>Home</button>
            </Link>


            <div className="lobby">
                <img src={profilePicture} style={{ width: "100px", height: "100px" }} className="centered-image" />
                {
                    singlePlayer ? <img src={unknown} style={{ width: "100px", height: "100px" }} className="centered-image"/> : <img src={plus} style={{ width: "100px", height: "100px" }} />
                }
                {
                    singlePlayer ? <img src={unknown} style={{ width: "100px", height: "100px" }} className="centered-image" /> : <img src={plus} style={{ width: "100px", height: "100px" }} />
                }
                {
                    singlePlayer ? <img src={unknown} style={{ width: "100px", height: "100px" }} className="centered-image" /> : <img src={plus} style={{ width: "100px", height: "100px" }} />
                }
            </div>
            {
                gameObject?.id ? 
                    (<Link to={`/game/${gameObject?.id}`}>
                    <button onClick={(e) => startGame(e)}>Start Game</button>
                    </Link>) : 'game object is null'
            }

        </div>
    )
}

export default Lobby;