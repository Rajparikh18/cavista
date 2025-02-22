import React, { useState } from 'react';
import VideoRoom from '../components/VideoRoom';
import './VideoConference.css';

const VideoConference = () => {
    const [roomCode, setRoomCode] = useState('');
    const [isJoined, setIsJoined] = useState(false);

    const handleJoinRoom = () => {
        if (roomCode.trim()) {
            setIsJoined(true);
        }
    };

    if (isJoined) {
        return <VideoRoom roomCode={roomCode} onLeave={() => setIsJoined(false)} />;
    }

    return (
        <div className="video-conference">
            <div className="conference-join">
                <h1>Join Video Conference</h1>
                <div className="join-container">
                    <input
                        type="text"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                        placeholder="Enter room code"
                        className="room-input"
                    />
                    <button onClick={handleJoinRoom} className="join-button">
                        Join Conference
                    </button>
                </div>
                <p className="instructions">
                    Share the room code with others to join the same conference.
                </p>
            </div>
        </div>
    );
};

export default VideoConference;
