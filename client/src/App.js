import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './Login';
import Home from './Home';
import Lobby from './Lobby';
import Game from './Game';
import cat from './assets/cat_icon.jpg'
function App() {
  const [user, setUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState("")
  const [gameObject, setGameObject] = useState(null)
  const [singlePlayer, setSinglePlayer] = useState(null)

  console.log(user)
  console.log('app just dropped, gameobject is ', gameObject)
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

  if (!user) return <Login onLogin={setUser} setProfilePicture={setProfilePicture} />;

  return (
    <>
      <Routes>
        <Route path="/" element={<Home user={user} profilePicture={profilePicture} setProfilePicture={setProfilePicture} gameObject={gameObject} setGameObject={setGameObject} singlePlayer={singlePlayer} setSinglePlayer={setSinglePlayer} />}></Route>
        <Route path="/lobby" element={<Lobby user={user} profilePicture={profilePicture} gameObject={gameObject} setGameObject={setGameObject} singlePlayer={singlePlayer} setSinglePlayer={setSinglePlayer}  />}></Route>
        <Route path="/game/:game_id" element={<Game user={user} profilePicture={profilePicture} gameObject={gameObject} setGameObject={setGameObject} singlePlayer={singlePlayer} setSinglePlayer={setSinglePlayer} />}></Route>
      </Routes>
    </>
  )
}

export default App;
