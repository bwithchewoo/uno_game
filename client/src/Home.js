import { useState, useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import drool from './assets/drool.jpg'
import penguin from './assets/penguin.jpg'
import cat from './assets/cat_icon.jpg'
import plane from './assets/plane-icon.jpg'
import loading from './assets/Loading.png'
import singleplayer from './assets/SINGLEPLAYER.png'
import multiplayer from './assets/MULTIPLAYER.png'
import { UserContext } from './App.js';
import { useGameContext } from './contexts/GameContext';

function Home() {
    const navigate = useNavigate();
    const [showOptions, setShowOptions] = useState(false);
    const [isVisible, setIsVisible] = useState(false)
    const [profileLoading, setProfileLoading] = useState(false)

    const userContext = useContext(UserContext);
    const { currentUserPlayerID, setCurrentUserPlayerID, user, setUser, playerData, setPlayerData, cable, profilePicture, setProfilePicture, singlePlayer, setSinglePlayer } = userContext;
    const { gameObject, updateGameObject } = useGameContext();

    useEffect(() => {
        console.log("anything" + gameObject)
        if (gameObject && gameObject.game_state == "created") {
            if (playerData) {
                navigate(`/lobby/${gameObject.id}`);
            }

        }
    }, [gameObject, playerData]);

    const showImageList = () => {
        setIsVisible(!isVisible)
    }

    const imageList = () => {
        if (isVisible) {
            return <div style={{ zIndex: 1, position: "absolute", top: "30%", left: "30%", borderStyle: "solid" }}>
                <img src={cat} style={{ width: "100px", height: "100px" }} onClick={(e) => { changePicture(e) }} />
                <img src={drool} style={{ width: "100px", height: "100px" }} onClick={(e) => { changePicture(e) }} />
                <img src={penguin} style={{ width: "100px", height: "100px" }} onClick={(e) => { changePicture(e) }} />
                <img src={plane} style={{ width: "100px", height: "100px" }} onClick={(e) => { changePicture(e) }} />
            </div>
        }
    }


    const changePicture = (e) => {
        setIsVisible(false)
        setProfileLoading(true)
        if (!e.target.src.includes(profilePicture)) {
            setProfilePicture(e.target.src)
            fetch(`/updatepicture`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "id": user.id,
                    "profile_picture": e.target.src
                }),
            }).then(() => {
                setProfileLoading(false)
            })
        } else {
            setProfileLoading(false)
        }
    }

    const createSingleplayerGame = (e) => {
        fetch("/creategame", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ singleplayer: true }),
        })
            .then(response => response.json())
            .then(data => {
                const gameObject = data

                updateGameObject(gameObject)
                setSinglePlayer(true)
                const gameChannel = cable.subscriptions.create({ channel: "GameChannel", game_id: data.id, username: "chewoo" }, {
                    received: function (data) {
                        // Handle the received broadcast message
                        // Update your client-side state or perform any necessary UI updates
                        console.log('from create single: ', data)
                        if (data?.updated_game) {
                            updateGameObject(data.updated_game)
                        }
                    }
                });
                //navigate(`/lobby/${gameObject.id}`);
            })
    }

    const createMultiplayerGame = (e) => {
        fetch("/creategame", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ singleplayer: false }),
        })
            .then(response => response.json())
            .then(data => {
                const game = data;
                updateGameObject(game);
                setSinglePlayer(false);
                //navigate(`/lobby/${gameObject.id}`);

                // Subscribe to the GameChannel with the game ID
                const gameChannel = cable.subscriptions.create({ channel: "GameChannel", game_id: game.id, username: "chewoo" }, {
                    received: function (data) {
                        // Handle the received broadcast message
                        // Update your client-side state or perform any necessary UI updates
                        console.log('from create multi: ', data)
                        if (data?.updated_game) {
                            updateGameObject(data.updated_game)
                        }
                    }
                });
            });
    };

    const handleClick = () => {
        setShowOptions((prevShowOptions) => !prevShowOptions);
    };

    function handleLogout() {
        fetch("/logout", { method: "DELETE" }).then((r) => {
            if (r.ok) {
                setUser(null);
            }
        });
    }

    const handleJoinGame = () => {
        fetch("/joingame", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ singleplayer: false }),
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
            })
            .then((data) => {
                console.log("Join data" + data)
                if (data.error === "no games to join") {
                    alert("no games to join, create a new game")
                } else {
                    updateGameObject(data);
                    const gameChannel = cable.subscriptions.create({ channel: "GameChannel", game_id: data.id, username: "chew" }, {
                        received: function (data) {
                            // Handle the received broadcast message
                            // Update your client-side state or perform any necessary UI updates
                            console.log('from join: ', data)
                            if (data?.updated_game) {
                                updateGameObject(data.updated_game)
                            }

                        }
                    });
                    //navigate(`/lobby/${gameObject.id}`);
                } // Log the parsed JSON object // Log the parsed JSON object
            });
    }

    return (
        <div>
            <div style={{ fontSize: "20px", display: "flex", flexDirection: "row" }}>
                {
                    profileLoading ? <img src={loading} style={{ width: "100px", height: "100px" }} /> : <img src={profilePicture} style={{ width: "100px", height: "100px" }} onClick={(e) => showImageList(e)} />
                }

                {imageList()}
                <div>
                    <div>
                        {user.username}
                    </div>
                    <div>
                        {user.user_rank}
                    </div>
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <div style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center" }}>

                        <img
                            src={singleplayer}
                            style={{
                                width: "200px",
                                height: "300px",
                                marginRight: "20px",
                            }}
                            onClick={(e) => createSingleplayerGame(e)}
                        />

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <img
                                src={multiplayer}
                                style={{
                                    width: "200px",
                                    height: "300px",
                                    cursor: "pointer",
                                    marginBottom: "20px",
                                }}
                                onClick={handleClick}
                            />
                            {showOptions && (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",

                                    }}
                                >
                                    <div
                                        style={{
                                            backgroundColor: "blue",
                                            width: "300px",
                                            height: "80px",
                                            marginBottom: "10px",
                                            cursor: "pointer",
                                            fontSize: "20px",
                                            color: "white",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",

                                        }}
                                        onClick={createMultiplayerGame}
                                    >
                                        Create Game
                                    </div>
                                    <div
                                        style={{
                                            backgroundColor: "green",
                                            width: "300px",
                                            height: "80px",
                                            cursor: "pointer",
                                            fontSize: "20px",
                                            color: "white",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",

                                        }}
                                        onClick={handleJoinGame}
                                    >
                                        Join Game
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div
                style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                }}
            >
                <button
                    style={{
                        backgroundColor: "red",
                        width: "120px",
                        height: "40px",
                        cursor: "pointer",
                        fontSize: "16px",
                        color: "white",
                    }}
                    onClick={handleLogout}  // Add your logout function
                >
                    Logout
                </button>
            </div>
        </div>
    )
}

export default Home;
