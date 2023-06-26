import React, { useState, useEffect } from 'react';
import { useGameContext } from '../contexts/GameContext';
const Timer = () => {
    const [seconds, setSeconds] = useState(2);
    const { gameObject, updateGameObject } = useGameContext();
    const isUserTurn = useGameContext().isUserTurn;

    console.log(isUserTurn)
    console.log(gameObject)
    useEffect(() => {
        if (isUserTurn) {
            setSeconds(2); // Reset seconds to 10 at the start of the user's turn
        }
    }, [isUserTurn]);

    useEffect(() => {
        // Function to call the API when the timer reaches 0
        const callAPI = () => {
            // Call your API here
            fetch('/playforplayer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    game_id: gameObject.id,
                }),
            })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
                })
               
        };

        let timer = null;

        if (isUserTurn && seconds > 0) {
            // Timer interval
            timer = setInterval(() => {
                // Use the most recent value of isUserTurn inside the interval callback
                setSeconds((prevSeconds) => {
                    if (prevSeconds === 1) {
                        // Call the API when the timer reaches 0
                        callAPI();
                        clearInterval(timer);
                    }
                    return prevSeconds - 1;
                });
            }, 1000);
        }

        // Clean up the interval when the component unmounts or when isUserTurn changes
        return () => clearInterval(timer);
    }, [isUserTurn, gameObject]);

    return (
        <div>
            {isUserTurn ? (
                <h1>Timer: {seconds}</h1>
            ) : (
                <h1>Not your turn yet.</h1>
            )}
        </div>
    );

};

export default Timer;
