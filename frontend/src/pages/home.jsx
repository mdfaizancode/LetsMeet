import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, TextField } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import VideoCallRoundedIcon from '@mui/icons-material/VideoCallRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';

function HomeComponent() {

    const navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const [error, setError] = useState("");
    const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);

    const { addToUserHistory } = useContext(AuthContext);
    const handleJoinVideoCall = async (event) => {
        event.preventDefault();
        const code = meetingCode.trim();
        if (!code) {
            setError("Please enter a meeting code.");
            return;
        }

        setError("");
        try {
            await addToUserHistory(code);
            navigate(`/${encodeURIComponent(code)}`);
        } catch {
            setError("Unable to join the meeting. Please check your connection and try again.");
        }
    }

    const handleStartMeeting = async () => {
        setError("");
        setIsCreatingMeeting(true);
        const meetingId = window.crypto?.randomUUID?.()
            || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

        try {
            await addToUserHistory(meetingId);
            navigate(`/${encodeURIComponent(meetingId)}`);
        } catch {
            setError("Unable to start the meeting. Please check your connection and try again.");
        } finally {
            setIsCreatingMeeting(false);
        }
    };

    return (
        <div className="meetContainer">
                <div className="leftPanel">
                    <div>
                        <p className="sectionEyebrow">YOUR SPACE TO CONNECT</p>
                        <h2>Make room for a great conversation.</h2>
                        <p className="meetingIntro">Start a private meeting in one click, or join someone with their meeting code.</p>

                        <div className="meetingActions">
                            <Button
                                className="startMeetingButton"
                                variant="contained"
                                startIcon={<VideoCallRoundedIcon />}
                                onClick={handleStartMeeting}
                                disabled={isCreatingMeeting}
                            >
                                {isCreatingMeeting ? "Creating your meeting..." : "Start a new meeting"}
                            </Button>
                            <p className="createMeetingHint">This creates a unique meeting code. Copy it from the next screen to invite others.</p>
                            <div className="joinMeetingHeading">
                                <span />
                                <span>OR JOIN WITH A CODE</span>
                                <span />
                            </div>

                            <form className="meetingCodeForm" onSubmit={handleJoinVideoCall}>
                                <TextField
                                    onChange={e => {
                                        setMeetingCode(e.target.value);
                                        if (error) setError("");
                                    }}
                                    value={meetingCode}
                                    id="meeting-code"
                                    label="Meeting Code"
                                    variant="outlined"
                                    error={Boolean(error)}
                                    helperText={error || "Enter a code shared by your host."}
                                    FormHelperTextProps={{ role: error ? "alert" : undefined }}
                                    inputProps={{ "aria-label": "Meeting Code" }}
                                />
                                <Button type="submit" variant="contained" startIcon={<MeetingRoomRoundedIcon />}>Join</Button>
                            </form>
                        </div>
                    </div>
                </div>
                <div className='rightPanel'>
                    <img src="/logo3.png" alt="A preview of a video meeting" />
                </div>
        </div>
    )
}


export default withAuth(HomeComponent)