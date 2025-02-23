import React, { useState } from 'react';
import { motion } from 'framer-motion';
import VideoRoom from '../components/Videoroom';

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg"
      >
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Join Video Conference
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connect with others in real-time
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700">
              Room Code
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="text"
              id="roomCode"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Enter room code"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleJoinRoom}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Join Conference
          </motion.button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setRoomCode(Math.random().toString(36).substring(7))}
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Create New Room
          </motion.button>
        </div>

        <div className="text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-600 bg-gray-50 p-4 rounded-md"
          >
            Share the room code with others to join the same conference.
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default VideoConference;