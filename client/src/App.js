import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './Login';
import Home from './Home';
import cat from './assets/cat_icon.jpg'
function App() {
  const [user, setUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState("")

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
        <Route path="/" element={<Home user={user} profilePicture={profilePicture} setProfilePicture={setProfilePicture} />}></Route>
      </Routes>
    </>
  )
}

export default App;
