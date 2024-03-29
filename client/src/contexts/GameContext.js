import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
// Create a new context
const GameContext = createContext();

// Custom hook to access the game context
export const useGameContext = () => useContext(GameContext);

// Game context provider component
export const GameProvider = ({ children }) => {
    const navigate = useNavigate();
    const userContext = useContext(UserContext);
    const { setPlayerData } = userContext;
    // State to hold the game object
    const [gameObject, setGameObject] = useState(null);
    const [currentUserPlayerID, setCurrentUserPlayerID] = useState(null);
    const [isUserTurn, setIsUserTurn] = useState(null);

    // Function to update the game object
    const updateGameObject = (newGameObject) => {
        setGameObject(newGameObject);
    };
    useEffect(() => {
        // get existin game if it exists
        fetch("/getexistinggame").then((r) => {
            if (r.ok) {
            
                r.json().then((game) => {
                    setGameObject(game)
                })

            }
        })
    }, []);

    useEffect(() => {

        if (gameObject && gameObject.game_state == "created") {
            fetch(`/profilepics/${gameObject.id}`).then((r) => {
                if (r.ok) {
         
                    r.json().then((data) => {
                        setPlayerData(data)
                    })

                }
            })

        }
        else if (gameObject && gameObject.game_state == "started") {
            navigate(`/game/${gameObject.id}`)
        }
    }, [gameObject, setPlayerData]);

    useEffect(() => {

        if (currentUserPlayerID === null && gameObject && gameObject.game_state != "ended") {
            fetch(`/currentuser/${gameObject.id}`).then((r) => {
                if (r.ok) {
                    r.json().then((user) => {
               
                        setCurrentUserPlayerID(user)

                    })

                }
            })
        }
    }, [gameObject]);

    useEffect(() => {
        if (currentUserPlayerID !== null && gameObject) {
            // Check if it's the user's turn based on the current_player_id and current user's player ID
            const isUserCurrentTurn = gameObject.current_player_id === currentUserPlayerID;
            console.log("isUserCurrentTurn" + isUserCurrentTurn)
            console.log("CurrentUserPlayerID" + currentUserPlayerID)
            setIsUserTurn(isUserCurrentTurn);
        }
    }, [gameObject, currentUserPlayerID, setIsUserTurn]);


    // Value object for the context provider
    const exports = {
        gameObject,
        updateGameObject,
        currentUserPlayerID,
        isUserTurn, 
        setCurrentUserPlayerID
    };

    return (
        <GameContext.Provider value={exports}>
            {children}
        </GameContext.Provider>
    );
};
