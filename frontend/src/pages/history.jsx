import React, { useCallback, useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Alert, Button } from '@mui/material';
import BackButton from '../components/BackButton';
export default function History() {


    const { getHistoryOfUser } = useContext(AuthContext);

    const [meetings, setMeetings] = useState([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const history = await getHistoryOfUser();
            if (!Array.isArray(history)) {
                throw new Error("Unexpected meeting history response.");
            }
            setMeetings(history);
        } catch {
            setError("Unable to load your meeting history. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [getHistoryOfUser]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return "Date unavailable";
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    return (
        <main className="historyPage">
            <header className="historyHeader">
                <BackButton fallback="/home" />
                <h1>Meeting history</h1>
            </header>
            <section className="historyList" aria-live="polite">
                {error && (
                    <Alert
                        severity="error"
                        action={<Button color="inherit" size="small" onClick={fetchHistory}>Retry</Button>}
                    >
                        {error}
                    </Alert>
                )}
                {loading ? (
                    <Typography color="text.secondary" align="center">Loading your meetings...</Typography>
                ) : meetings.length > 0 ? meetings.map((e, i) => {
                    return (
                        <Card className="historyCard" key={`${e.meetingCode}-${e.date || i}`} variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                                    Meeting code: {e.meetingCode}
                                </Typography>
                                <Typography color="text.secondary">
                                    {formatDate(e.date)}
                                </Typography>
                            </CardContent>
                        </Card>
                    )
                }) : !error && (
                    <div className="historyEmpty">
                        <Typography variant="h6" gutterBottom>No meetings yet</Typography>
                        <Typography color="text.secondary">Your recent meeting codes will appear here.</Typography>
                    </div>
                )}
            </section>
        </main>
    )
}
