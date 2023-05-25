import { useState } from 'react'
import drool from './assets/drool.jpg'
import penguin from './assets/penguin.jpg'
import cat from './assets/cat_icon.jpg'
import plane from './assets/plane-icon.jpg'
import loading from './assets/Loading.png'
import singleplayer from './assets/SINGLEPLAYER.png'
function Home({ user, profilePicture, setProfilePicture }) {
    const [isVisible, setIsVisible] = useState(false)
    const [profileLoading, setProfileLoading] = useState(false)

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
            <div>
                <img src={singleplayer} style={{ position: "absolute", top: "30%", left: "30%", width: "200px", height: "300px" }} />
            </div>
        </div>
    )
}

export default Home;
