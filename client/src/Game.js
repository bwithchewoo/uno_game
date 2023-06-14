import { useEffect, useState } from 'react'
function Game({ user, profilePicture, gameObject, setGameObject, singlePlayer, setSinglePlayer }) {
    const [playerHands, setPlayerHands] = useState([])
    useEffect(() => {
        if (gameObject && gameObject.players) {
            setPlayerHands(gameObject.players);
        }
    }, [gameObject]);

    if (!playerHands || playerHands.length === 0 || playerHands.some(player => !player.cards)) {
        return <div>Loading...</div>; // Render a loading indicator or message
    }


    return (
        <div className="game-container">
            {(!playerHands || playerHands.length === 0 || playerHands.some(player => !player.cards))
                ? <div>Loading...</div> // Render a loading indicator or message
                : playerHands.map((player, index) => {
                    let position;
                    const currentPlayerIndex = playerHands.findIndex(p => p.id === gameObject.current_player_id)
                    const isCurrentPlayer = currentPlayerIndex !== -1 && currentPlayerIndex === index;
                    if (currentPlayerIndex === -1) {
                        // If current player ID not found, use the default positions
                        position = index === 0 ? 'right'
                            : index === 1 ? 'top'
                                : 'left';
                    } else {
                        const offset = index - currentPlayerIndex;
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
                                        className={`card ${player.id !== gameObject.current_player_id ? 'blank' : ''}`}
                                        style={{ backgroundColor: isCurrentPlayer ? card.color : 'white' }}
                                        key={card.id}
                                    >
                                        {/* Render card content here */}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default Game;
