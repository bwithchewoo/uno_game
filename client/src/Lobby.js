import { useState } from 'react'
import {Link} from 'react-router-dom';
import plus from './assets/plus-sign.jpg'
import unknown from './assets/unknown.png'

function Lobby({ user, profilePicture, gameObject, setGameObject, singlePlayer, setSinglePlayer}) {


    const deleteGame = (e) => {
        let gameId = gameObject.id
        fetch(`/deletegame/${gameId}`, {
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

    return (
        <div>
            <Link to="/">
                <button onClick={(e) => deleteGame(e)}>Home</button>
            </Link>


       
            <img src={profilePicture} style={{ width: "100px", height: "100px" }} />
            {
                singlePlayer ? <img src={unknown} style={{ width: "100px", height: "100px" }} /> : <img src={plus} style={{ width: "100px", height: "100px" }} />
            }
             {
                singlePlayer ? <img src={unknown} style={{ width: "100px", height: "100px" }} /> : <img src={plus} style={{ width: "100px", height: "100px" }} />
            }
             {
                singlePlayer ? <img src={unknown} style={{ width: "100px", height: "100px" }} /> : <img src={plus} style={{ width: "100px", height: "100px" }} />
            }
        </div>
    )
}

export default Lobby;