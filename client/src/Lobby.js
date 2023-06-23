import { useState, useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import ProfilePicture from './components/ProfilePicture.js';
import { UserContext } from './App.js';
import { useGameContext } from './contexts/GameContext.js';

function Lobby() {
    const navigate = useNavigate()
    const userContext = useContext(UserContext);
    const { user, cable, playerData, setPlayerData, profilePicture, setProfilePicture, singlePlayer, setSinglePlayer } = userContext;
    const { gameObject, updateGameObject } = useGameContext();
    if (!gameObject?.id) {
        navigate("/")
    }



    const deleteGame = (e) => {
        console.log(gameObject)
        if (gameObject?.id) {
            console.log("DELETE ME")
            fetch(`/deletegame/${gameObject?.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Add any necessary request body or headers
                // body: JSON.stringify({ key: value }),
            })
                .then(() => {
                    updateGameObject(null)
                })
        }

    }

    const startGame = (e) => {
        if (gameObject?.id) {
            fetch("/startgame", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ game_id: gameObject.id }),
            })
                .then(response => response.json())
                .then(data => {
                    updateGameObject(data)
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
                {/* <img src={profilePicture} style={{ width: "100px", height: "100px" }} className="centered-image" /> */}
                {Array(4).fill().map((_, index) => {
                    const playerArray = playerData && playerData.players;
                    console.log("this is" + playerArray)
                    const player = Array.isArray(playerArray) && playerArray.length > index ? playerArray[index] : null;
                    console.log('player:', player);

                    return (
                        <ProfilePicture index={index} player_data={player}></ProfilePicture>
                    )
                })}
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
