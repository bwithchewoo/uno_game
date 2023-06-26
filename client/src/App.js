import { useEffect, useState, createContext, useContext } from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './Login';
import Home from './Home';
import Lobby from './Lobby';
import Game from './Game';
import cat from './assets/cat_icon.jpg'
import * as ActionCable from "@rails/actioncable";
import { GameProvider } from './contexts/GameContext';

export const UserContext = createContext();
const cable = ActionCable.createConsumer("ws://unogame.onrender.com/cable");
function App() {
  const [playerData, setPlayerData] = useState(null)
  const [user, setUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState("")

  const [singlePlayer, setSinglePlayer] = useState(null)
  const userContextValue = { playerData, setPlayerData, user, setUser, cable, profilePicture, setProfilePicture, singlePlayer, setSinglePlayer };



  useEffect(() => {
    // auto-login
    fetch("/me").then((r) => {
      if (r.ok) { //response successful
        r.json().then((user) => {
          setUser(user)

          if (user.profile_picture) {
            setProfilePicture(user.profile_picture)
          }
          else {

            setProfilePicture(cat)
          }
        })
      }
    });




  }, []);



  if (!user) return <Login onLogin={setUser} setProfilePicture={setProfilePicture} />;


  return (

    <UserContext.Provider value={userContextValue}>
      <GameProvider>
        <>
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/lobby/:game_id" element={<Lobby />}></Route>
            <Route path="/game/:game_id" element={<Game />}></Route>
          </Routes>
        </>
      </GameProvider>
    </UserContext.Provider>
  )
}

export default App;

