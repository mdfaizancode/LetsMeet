import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import server from '../environment';
import { useNavigate } from 'react-router-dom';

const server_url = server;

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    const connections = useRef({}).current;
    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(false);

    let [audioAvailable, setAudioAvailable] = useState(false);

    let [video, setVideo] = useState(false);

    let [audio, setAudio] = useState(false);

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(false);

    let [screenAvailable, setScreenAvailable] = useState(false);
    let [mediaError, setMediaError] = useState("");

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;
        const getPermissions = async () => {
            let cameraStream;
            let microphoneStream;
            try {
                cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
            } catch {
                cameraStream = null;
            }
            try {
                microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch {
                microphoneStream = null;
            }

            if (!isMounted) {
                cameraStream?.getTracks().forEach(track => track.stop());
                microphoneStream?.getTracks().forEach(track => track.stop());
                return;
            }

            const videoTracks = cameraStream?.getVideoTracks() ?? [];
            const audioTracks = microphoneStream?.getAudioTracks() ?? [];
            const hasVideo = videoTracks.length > 0;
            const hasAudio = audioTracks.length > 0;
            setVideoAvailable(hasVideo);
            setAudioAvailable(hasAudio);
            setVideo(hasVideo);
            setAudio(hasAudio);
            setScreenAvailable(Boolean(navigator.mediaDevices?.getDisplayMedia));

            if (hasVideo || hasAudio) {
                const stream = new MediaStream([...videoTracks, ...audioTracks]);
                window.localStream = stream;
                if (localVideoref.current) localVideoref.current.srcObject = stream;
                setMediaError(
                    !hasVideo || !hasAudio
                        ? "Camera or microphone access was not granted. You can still join with available devices."
                        : ""
                );
            } else {
                setMediaError("Camera or microphone access is unavailable. You can still join without them.");
            }
        };

        getPermissions();
        return () => {
            isMounted = false;
        };
    }, [connections]);

    useEffect(() => () => {
        socketRef.current?.disconnect();
        Object.values(connections).forEach(connection => {
            if (connection.signalingState !== "closed") connection.close();
        });
        Object.keys(connections).forEach(peerId => delete connections[peerId]);
        window.localStream?.getTracks().forEach(track => track.stop());
        window.localStream = null;
    }, [connections]);

    const sendPeerOffer = (peerId) => {
        const connection = connections[peerId];
        if (!connection || connection.signalingState === "closed") return;

        connection.createOffer()
            .then(description => connection.setLocalDescription(description))
            .then(() => {
                socketRef.current?.emit(
                    'signal',
                    peerId,
                    JSON.stringify({ sdp: connection.localDescription })
                );
            })
            .catch(error => console.error("Unable to negotiate meeting connection.", error));
    };

    let getMedia = () => {
        connectToSocketServer();
    }




    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        Object.keys(connections).forEach(id => {
            if (id === socketIdRef.current) return;

            connections[id].addStream(window.localStream)
            sendPeerOffer(id);
        });

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            Object.keys(connections).forEach(id => {
                if (id === socketIdRef.current) return;
                connections[id].addStream(window.localStream)
                sendPeerOffer(id);
            });
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }





    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        Object.keys(connections).forEach(id => {
            if (id === socketIdRef.current) return;

            connections[id].addStream(window.localStream)
            sendPeerOffer(id);
        });

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()

        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }




    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream);
                            sendPeerOffer(id2);
                        } catch (error) {
                            console.error("Unable to add local media to the meeting connection.", error);
                        }
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        const nextVideoState = !video;
        window.localStream?.getVideoTracks().forEach(track => {
            track.enabled = nextVideoState;
        });
        setVideo(nextVideoState);
    }
    let handleAudio = () => {
        const nextAudioState = !audio;
        window.localStream?.getAudioTracks().forEach(track => {
            track.enabled = nextAudioState;
        });
        setAudio(nextAudioState);
    }

    let handleScreen = async () => {
        if (screen) {
            window.localStream?.getVideoTracks().forEach(track => track.stop());
            setScreen(false);
            getUserMedia();
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            setScreen(true);
            getDislayMediaSuccess(stream);
        } catch {
            setMediaError("Screen sharing was cancelled or is unavailable.");
        }
    }

    let handleEndCall = () => {
        window.localStream?.getTracks().forEach(track => track.stop());
        socketRef.current?.disconnect();
        Object.values(connections).forEach(connection => {
            if (connection.signalingState !== "closed") connection.close();
        });
        Object.keys(connections).forEach(peerId => delete connections[peerId]);
        window.localStream = null;
        navigate("/");
    }

    let toggleChat = () => {
        if (!showModal) setNewMessages(0);
        setModal(!showModal);
    }
    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };



    let sendMessage = (event) => {
        event.preventDefault();
        const trimmedMessage = message.trim();
        if (!trimmedMessage || !socketRef.current?.connected) return;
        socketRef.current.emit('chat-message', trimmedMessage, username)
        setMessage("");
    }

    
    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }


    return (
        <div>

            {askForUsername === true ?

                <div className={styles.lobbyPage}>
                    <section className={styles.lobbyCard}>
                        <div className={styles.lobbyContent}>
                            <span className={styles.eyebrow}>READY WHEN YOU ARE</span>
                            <h1>Join your meeting</h1>
                            <p>Choose the name other participants will see.</p>
                            {mediaError && <p className={styles.mediaError} role="status">{mediaError}</p>}
                            <form
                                className={styles.lobbyForm}
                                onSubmit={event => {
                                    event.preventDefault();
                                    connect();
                                }}
                            >
                                <TextField
                                    id="meeting-username"
                                    label="Your name"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    variant="outlined"
                                    fullWidth
                                    required
                                    inputProps={{ maxLength: 80 }}
                                    autoComplete="name"
                                />
                                <Button type="submit" variant="contained" disabled={!username.trim()}>
                                    Join meeting
                                </Button>
                            </form>
                        </div>
                        <div className={styles.lobbyPreview}>
                            <video ref={localVideoref} autoPlay muted playsInline />
                            <span>Camera preview</span>
                        </div>
                    </section>
                </div> :


                <div className={styles.meetVideoContainer}>
                    {mediaError && <p className={styles.meetingNotice} role="status">{mediaError}</p>}
                    {showModal ? <div className={styles.chatRoom}>

                        <div className={styles.chatContainer}>
                            <h1>Chat</h1>

                            <div className={styles.chattingDisplay} aria-live="polite" aria-relevant="additions">

                                {messages.length !== 0 ? messages.map((item, index) => {
                                    return (
                                        <div key={`${item.sender}-${index}`}>
                                            <p>{item.sender}</p>
                                            <p>{item.data}</p>
                                        </div>
                                    )
                                }) : <p>No Messages Yet</p>}


                            </div>

                            <form className={styles.chattingArea} onSubmit={sendMessage}>
                                <TextField
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    id="meeting-chat-message"
                                    label="Write a message"
                                    variant="outlined"
                                    inputProps={{ "aria-label": "Write a message", maxLength: 1000 }}
                                />
                                <Button variant='contained' type="submit" disabled={!message.trim()}>Send</Button>
                            </form>


                        </div>
                    </div> : <></>}


                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo} disabled={!videoAvailable} style={{ color: "white" }} aria-label={videoAvailable ? (video ? "Turn camera off" : "Turn camera on") : "Camera unavailable"} aria-pressed={video}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton onClick={handleEndCall} style={{ color: "red" }} aria-label="End meeting">
                            <CallEndIcon  />
                        </IconButton>
                        <IconButton onClick={handleAudio} disabled={!audioAvailable} style={{ color: "white" }} aria-label={audioAvailable ? (audio ? "Mute microphone" : "Unmute microphone") : "Microphone unavailable"} aria-pressed={audio}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        {screenAvailable === true ?
                            <IconButton onClick={handleScreen} style={{ color: "white" }} aria-label={screen ? "Stop screen sharing" : "Share screen"} aria-pressed={Boolean(screen)}>
                                {screen === true ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                            </IconButton> : <></>}

                        <Badge badgeContent={newMessages} max={999} color='orange'>
                            <IconButton onClick={toggleChat} style={{ color: "white" }} aria-label={showModal ? "Close chat" : "Open chat"} aria-pressed={showModal}>
                                <ChatIcon />
                            </IconButton>
                        </Badge>

                    </div>


                    <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>

                    <div className={styles.conferenceView}>
                        {videos.map((video) => (
                            <div key={video.socketId}>
                                <video

                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                >
                                </video>
                            </div>

                        ))}

                    </div>

                </div>

            }

        </div>
    )
}
