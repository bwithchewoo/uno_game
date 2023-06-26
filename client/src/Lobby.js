import { useState, useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import ProfilePicture from './components/ProfilePicture.js';
import { UserContext } from './App.js';
import { useGameContext } from './contexts/GameContext.js';

function Lobby() {
    const navigate = useNavigate()
    const userContext = useContext(UserContext);
    const { user, cable, playerData, setPlayerData, profilePicture, setProfilePicture, singlePlayer, setSinglePlayer } = userContext;
    const { setCurrentUserPlayerID, gameObject, updateGameObject } = useGameContext();
    if (!gameObject?.id) {
        navigate("/")
    }



    const deleteGame = (e) => {

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
                    updateGameObject(null)
                    setCurrentUserPlayerID(null)
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
                    if (data.error == "Not enough players to start the game.") {
                        alert("Not enough players to start the game. Wait for more players or add bots.")
                    } 
                })
        }
    }


   
    return (
        <div>
            <Link to="/">
                <button onClick={(e) => deleteGame(e)}>Home</button>
            </Link>
            <div className="lobby">
                {/* <img src={profilePicture} style={{ width: "100px", height: "100px" }} className="centered-image" /> */}
                {Array(4).fill().map((_, index) => {
                    const playerArray = playerData && playerData.players;
                
                    const player = Array.isArray(playerArray) && playerArray.length > index ? playerArray[index] : null;
            
                    return (
                        <ProfilePicture index={index} player_data={player} gameObject={gameObject} updateGameObject={updateGameObject}></ProfilePicture>
                    )
                })}
            </div>  
            <button onClick={(e) => startGame(e)}>Start Game</button>
        </div>
    )
}

export default Lobby;
