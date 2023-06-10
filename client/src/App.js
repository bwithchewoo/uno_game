import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './Login';
import Home from './Home';
import Lobby from './Lobby';
import cat from './assets/cat_icon.jpg'
function App() {
  const [user, setUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState("")
  const [gameObject, setGameObject] = useState(null)
  const [singlePlayer, setSinglePlayer] = useState(null)

  console.log(user)
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
    <>
      <Routes>
        <Route path="/" element={<Home user={user} profilePicture={profilePicture} setProfilePicture={setProfilePicture} gameObject={gameObject} setGameObject={setGameObject} singlePlayer={singlePlayer} setSinglePlayer={setSinglePlayer} />}></Route>
        <Route path="/lobby" element={<Lobby user={user} profilePicture={profilePicture} gameObject={gameObject} setGameObject={setGameObject} singlePlayer={singlePlayer} setSinglePlayer={setSinglePlayer}  />}></Route>
        <Route path="/game/:game_id"></Route>
      </Routes>
    </>
  )
}

export default App;
