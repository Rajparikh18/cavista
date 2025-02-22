import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import './VideoRoom.css';

const VideoRoom = ({ roomCode, onLeave }) => {
    const socket = useSocket();
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const peerConnectionRef = useRef();
    const localStreamRef = useRef();
    const [participants, setParticipants] = useState([]);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const peerConnectionConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
        ]
    };

    useEffect(() => {
        if (!socket) return;

        const initializeMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: true, 
                    audio: true 
                });
                localStreamRef.current = stream;
                localVideoRef.current.srcObject = stream;
                socket.emit('join-video-room', roomCode);
            } catch (error) {
                console.error('Error accessing media devices:', error);
            }
        };

        initializeMedia();

        socket.on('room-joined', async ({ participants: roomParticipants }) => {
            setParticipants(roomParticipants);
            if (roomParticipants.length === 2) {
                await initializePeerConnection();
                const offer = await peerConnectionRef.current.createOffer();
                await peerConnectionRef.current.setLocalDescription(offer);
                socket.emit('video-offer', { offer, roomCode });
            }
        });
        socket.on('video-offer', async (offer) => {
            if (!peerConnectionRef.current) {
                await initializePeerConnection();
            }
        
            const peerConnection = peerConnectionRef.current;
        
            // Check if we are in a valid state to set remote description
            if (peerConnection.signalingState !== "stable") {
                console.warn("Skipping setRemoteDescription: Invalid signaling state", peerConnection.signalingState);
                return;
            }
        
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
        
            socket.emit('video-answer', { answer, roomCode });
        });
        
        socket.on('video-answer', async (answer) => {
            if (!peerConnectionRef.current) return;
        
            const peerConnection = peerConnectionRef.current;
        
            // Ensure that an offer was set before setting the answer
            if (peerConnection.signalingState !== "have-local-offer") {
                console.warn("Skipping setRemoteDescription: Unexpected signaling state", peerConnection.signalingState);
                return;
            }
        
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        });
        
        socket.on('ice-candidate', async (candidate) => {
            if (peerConnectionRef.current) {
                try {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    console.error("Error adding received ICE candidate", err);
                }
            }
        });
        
        socket.on('participant-left', ({ participants: newParticipants }) => {
            setParticipants(newParticipants);
        
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
            }
        
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }
        });
        

        return () => {
            cleanup();
        };
    }, [socket, roomCode]);

    const initializePeerConnection = async () => {
        try {
            peerConnectionRef.current = new RTCPeerConnection(peerConnectionConfig);
            console.log('PeerConnection created');
            
            // Add all local tracks to the peer connection
            localStreamRef.current.getTracks().forEach(track => {
                const sender = peerConnectionRef.current.addTrack(track, localStreamRef.current);
                console.log('Added local track:', track.kind);
            });

            // Handle remote stream more explicitly
            peerConnectionRef.current.ontrack = (event) => {
                console.log('Received remote track:', event.track.kind);
                if (remoteVideoRef.current) {
                    if (!remoteVideoRef.current.srcObject) {
                        remoteVideoRef.current.srcObject = new MediaStream();
                    }
                    remoteVideoRef.current.srcObject.addTrack(event.track);
                }
            };

            // Ice candidate handling
            peerConnectionRef.current.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log('Sending ICE candidate');
                    socket.emit('ice-candidate', {
                        candidate: event.candidate,
                        roomCode
                    });
                }
            };

            // Connection state logging
            peerConnectionRef.current.oniceconnectionstatechange = () => {
                console.log('ICE Connection State:', peerConnectionRef.current.iceConnectionState);
            };

            peerConnectionRef.current.onconnectionstatechange = () => {
                console.log('Connection State:', peerConnectionRef.current.connectionState);
            };

        } catch (error) {
            console.error('Error in initializePeerConnection:', error);
        }
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setIsMuted(!audioTrack.enabled);
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOff(!videoTrack.enabled);
        }
    };

    // Add more detailed cleanup
    const cleanup = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                track.stop();
                console.log('Stopped track:', track.kind);
            });
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            console.log('Closed peer connection');
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
        socket?.emit('leave-video-room', roomCode);
    };

    const handleLeave = () => {
        cleanup();
        onLeave();
    };

    return (
        <div className="video-room">
            <div className="video-grid">
                <div className="video-container">
                    <video ref={localVideoRef} autoPlay playsInline muted />
                    <div className="video-label">You</div>
                </div>
                <div className="video-container">
                    <video ref={remoteVideoRef} autoPlay playsInline />
                    <div className="video-label">
                        {participants.length > 1 ? 'Peer' : 'Waiting for peer...'}
                    </div>
                </div>
            </div>
            
            <div className="controls">
                <button onClick={toggleMute}>
                    {isMuted ? 'Unmute' : 'Mute'}
                </button>
                <button onClick={toggleVideo}>
                    {isVideoOff ? 'Start Video' : 'Stop Video'}
                </button>
                <button onClick={handleLeave} className="leave-btn">
                    Leave Call
                </button>
            </div>

            <div className="participants-list">
                <h3>Participants ({participants.length})</h3>
                <ul>
                    {participants.map((participant, index) => (
                        <li key={index}>{participant}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default VideoRoom;
