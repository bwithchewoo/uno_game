import { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { UserContext } from './App.js';
import { useGameContext } from './contexts/GameContext';
import Timer from './components/Timer.js';
function Game() {
    const navigate = useNavigate();
    const [playerHands, setPlayerHands] = useState([])
    const [lastUpdatedCard, setLastUpdatedCard] = useState(null);
    const userContext = useContext(UserContext);
    const { gameObject, updateGameObject } = useGameContext();
    const { user, cable, profilePicture, setProfilePicture, singlePlayer, setSinglePlayer } = userContext;

    useEffect(() => {
        if (gameObject && gameObject.players) {
            setPlayerHands(gameObject.players);
            let lastUpdated = null;
            let lastUpdatedTimestamp = null;

            gameObject.cards.forEach((card) => {
                if (card.in_play && (!lastUpdatedTimestamp || card.updated_at > lastUpdatedTimestamp)) {
                    lastUpdated = card;
                    lastUpdatedTimestamp = card.updated_at;
                }
            });

            setLastUpdatedCard(lastUpdated);
        }
    }, [gameObject]);

    if (gameObject) {
        if (gameObject.game_state === 'ended') {
            alert('The game has ended.');
            navigate('/'); // Route to the home page

        }
    }

    if (!playerHands || playerHands.length === 0 || playerHands.some(player => !player.cards)) {
        return <div>Loading...</div>; // Render a loading indicator or message
    }

    const playCard = (cardId, cardColor) => {
        console.log('Card color:', cardColor);
        if (cardColor === 'black') {
            let chosenColor = '';

            const handleColorInput = () => {
                const userInput = prompt('Enter a color (red, blue, yellow, green):');
                if (userInput && ['red', 'blue', 'yellow', 'green'].includes(userInput.toLowerCase())) {
                    chosenColor = userInput.toLowerCase();
                    // Make the API call with chosenColor
                    fetch('/playcard', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            game_id: gameObject.id,
                            card_id: cardId,
                            color: chosenColor,
                        }),
                    })
                        .then((response) => {
                            if (response.ok) {
                                return response.json();
                            }
                        })
                        .then((data) => {
                            console.log(data)
                            if (data.error === "not playable card") {
                                alert("not playable card")
                            } else if (data.error === "not your turn") {
                                alert("not your turn")
                            } else {
                                updateGameObject(data);
                            } // Log the parsed JSON object // Log the parsed JSON object
                        });
                } else {
                    console.log('Invalid color entered!');
                }
            };

            handleColorInput(); // Call the function directly

            return null; // Return null since no UI element is rendered
        } else {
            fetch('/playcard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    game_id: gameObject.id,
                    card_id: cardId,
                }),
            })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
                })
                .then((data) => {
                    console.log(data)
                    if (data.error === "not playable card") {
                        alert("not playable card")
                    } else if (data.error === "not your turn") {
                        alert("not your turn")
                    } else {
                        updateGameObject(data);
                    } // Log the parsed JSON object // Log the parsed JSON object
                });
        }
    }

    const drawCard = () => {
        fetch('/drawcards', {
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
            .then((data) => {
                console.log("this is", data)

                updateGameObject(data);
                // Log the parsed JSON object // Log the parsed JSON object
            });
    }

    return (
        <div className="game-container">
            {(!playerHands || playerHands.length === 0 || playerHands.some(player => !player.cards))
                ? <div>Loading...</div> // Render a loading indicator or message
                : (
                    <>
                        <div className="special-cards-container">
                            <div className="card deck-card" onClick={() => drawCard()}>
                                Uno
                            </div>
                            <div className="card last-card-played">
                                {lastUpdatedCard && (
                                    <div
                                        className="card"
                                        style={{ backgroundColor: lastUpdatedCard.color }}
                                    >
                                        {lastUpdatedCard.value}
                                    </div>
                                )}
                            </div>

                        </div>
                        <Timer />
                        {playerHands.map((player, index) => {
                            let position;
                            const userPlayerIndex = playerHands.findIndex(p => p.user_id === user.id)
                            const isCurrentPlayer = userPlayerIndex !== -1 && userPlayerIndex === index;
                            if (userPlayerIndex === -1) {
                                // If current player ID not found, use the default positions
                                position = index === 0 ? 'right'
                                    : index === 1 ? 'top'
                                        : 'left';
                            } else {
                                const offset = index - userPlayerIndex;
                                const adjustedIndex = offset < 0 ? offset + playerHands.length : offset;

                                position = adjustedIndex === 0 ? 'bottom'
                                    : adjustedIndex === 1 ? 'right'
                                        : adjustedIndex === 2 ? 'top'
                                            : 'left';
                            }

                            return (
                                <div className={`player-container ${position}`} key={player.id}>

                                    <div className="card-container">
                                        {player.cards.map((card) => (
                                            <div
                                                className={`card ${isCurrentPlayer ? '' : 'blank'} ${card.color === 'black' ? 'white-text' : ''}`}
                                                style={{ backgroundColor: isCurrentPlayer ? card.color : 'white' }}
                                                key={card.id}
                                                onClick={() => playCard(card.id, card.color)}
                                            >
                                                <span className="card-value">{isCurrentPlayer ? card.value : ''}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </>
                )
            }
        </div>
    );
}

export default Game;
