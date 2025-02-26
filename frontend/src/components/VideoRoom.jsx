import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { motion } from 'framer-motion';
import { Copy, Mic, MicOff, Video, VideoOff, LogOut } from 'lucide-react';

const VideoRoom = ({ roomCode, onLeave }) => {
  const socket = useSocket();
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef();
  const localStreamRef = useRef();
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [mediaError, setMediaError] = useState(null);

  const peerConnectionConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    let mounted = true;

    const initializeMedia = async () => {
      try {
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        });

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        if (socket) {
          console.log('Emitting join-video-room with code:', roomCode);
          socket.emit('join-video-room', roomCode);
        }

        setMediaError(null);
      } catch (error) {
        console.error('Error accessing media devices:', error);
        setMediaError(`Failed to access camera/microphone: ${error.message}`);
      }
    };

    if (socket) {
      initializeMedia();

      socket.on('room-joined', ({ participants: roomParticipants }) => {
        console.log('Room joined event received. Participants:', roomParticipants);
        setParticipants(roomParticipants);
        
        if (roomParticipants.length === 2) {
          initializePeerConnection().then(() => {
            if (peerConnectionRef.current) {
              peerConnectionRef.current.createOffer()
                .then(offer => peerConnectionRef.current.setLocalDescription(offer))
                .then(() => {
                  socket.emit('video-offer', { 
                    offer: peerConnectionRef.current.localDescription,
                    roomCode 
                  });
                })
                .catch(error => console.error('Error creating offer:', error));
            }
          });
        }
      });

      socket.on('video-offer', async (offer) => {
        console.log('Received video offer');
        try {
          if (!peerConnectionRef.current) {
            await initializePeerConnection();
          }
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          socket.emit('video-answer', { answer, roomCode });
        } catch (error) {
          console.error('Error handling video offer:', error);
        }
      });

      socket.on('video-answer', async (answer) => {
        console.log('Received video answer');
        try {
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          }
        } catch (error) {
          console.error('Error handling video answer:', error);
        }
      });

      socket.on('ice-candidate', async (candidate) => {
        try {
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          }
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      });

      socket.on('participant-left', ({ participants: newParticipants }) => {
        console.log('Participant left. New participants:', newParticipants);
        setParticipants(newParticipants);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
        }
      });
    }

    return () => {
      mounted = false;
      cleanup();
    };
  }, [socket, roomCode]);

  const initializePeerConnection = async () => {
    try {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }

      peerConnectionRef.current = new RTCPeerConnection(peerConnectionConfig);
      
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          peerConnectionRef.current.addTrack(track, localStreamRef.current);
        });
      }

      peerConnectionRef.current.ontrack = (event) => {
        console.log('Received remote track');
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('ice-candidate', {
            candidate: event.candidate,
            roomCode
          });
        }
      };

      peerConnectionRef.current.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnectionRef.current.connectionState);
      };

      peerConnectionRef.current.oniceconnectionstatechange = () => {
        console.log('ICE Connection state:', peerConnectionRef.current.iceConnectionState);
      };

      return peerConnectionRef.current;
    } catch (error) {
      console.error('Error initializing peer connection:', error);
      throw error;
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (socket) {
      socket.emit('leave-video-room', roomCode);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const handleLeave = () => {
    cleanup();
    onLeave();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {mediaError && (
        <div className="max-w-4xl mx-auto mb-4">
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg">
            {mediaError}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-gray-500">Room Code:</span>
            <code className="bg-gray-100 px-3 py-1 rounded text-gray-700">{roomCode}</code>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyCode}
              className="text-blue-500 hover:text-blue-600"
            >
              <Copy size={16} />
            </motion.button>
          </div>
          <div className="text-gray-500">
            Participants: {participants.length}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="aspect-video bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="relative h-full">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover bg-gray-100"
            />
            <div className="absolute top-3 left-3 bg-black/30 text-white px-2 py-1 text-sm rounded">
              You
            </div>
          </div>
        </div>

        <div className="aspect-video bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="relative h-full">
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover bg-gray-100"
            />
            <div className="absolute top-3 left-3 bg-black/30 text-white px-2 py-1 text-sm rounded">
              {participants.length > 1 ? 'Peer' : 'Waiting for peer...'}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-4xl mx-auto mt-6">
        <div className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-center gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleMute}
            className={`p-3 rounded-full ${
              isMuted 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleVideo}
            className={`p-3 rounded-full ${
              isVideoOff 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLeave}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
          >
            <LogOut size={20} />
            Leave Call
          </motion.button>
        </div>
      </div>

      {copySuccess && (
        <div className="fixed top-4 right-4 bg-green-100 text-green-700 px-4 py-2 rounded-lg shadow-sm">
          Room code copied!
        </div>
      )}
    </div>
  );
};

export default VideoRoom;