import React from 'react';
import plus from '../assets/plus-sign.jpg'
import unknown from '../assets/unknown.png'
import cat from '../assets/cat_icon.jpg'


const ProfilePicture = ({ index, player_data }) => {
    let picture = plus;
    if (player_data?.is_bot) {
        picture = unknown
    } else if (player_data?.is_bot === false) {
        picture = player_data?.profile_picture ? player_data.profile_picture : cat
    }
    return (
        <img
            key={index}
            src={picture}
            style={{ width: "100px", height: "100px" }}
            className="centered-image"
        />
    );
};

export default ProfilePicture;
