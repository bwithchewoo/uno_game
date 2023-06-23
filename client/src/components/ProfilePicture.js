import React from 'react';
import plus from '../assets/plus-sign.jpg'
import unknown from '../assets/unknown.png'
import cat from '../assets/cat_icon.jpg'


const ProfilePicture = ({ index, player_data, gameObject, updateGameObject }) => {
    let picture = plus;
    let addBot = null;
    if (player_data?.is_bot) {
        picture = unknown
    } else if (player_data?.is_bot === false) {
        picture = player_data?.profile_picture ? player_data.profile_picture : cat
    }
    if (picture === plus) {
        addBot = () => {
            fetch("/addbot", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ game_id: gameObject.id }),
            })
                .then(response => response.json())
                .then(data => {
                        console.log(data)
                        updateGameObject(data)
                })
        };
    }
    return (
        <img
            key={index}
            src={picture}
            style={{ width: "100px", height: "100px" }}
            className="centered-image"
            onClick={addBot}
        />
    );
};

export default ProfilePicture;
