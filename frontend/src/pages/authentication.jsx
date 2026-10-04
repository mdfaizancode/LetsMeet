import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';
import BackButton from '../components/BackButton';



// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function Authentication() {

    

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);


    const [formState, setFormState] = React.useState(0);

    const [open, setOpen] = React.useState(false)
    const [submitting, setSubmitting] = React.useState(false);


    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async (event) => {
        event.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            if (formState === 0) {
                await handleLogin(username, password);
            }
            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                setUsername("");
                setMessage(result);
                setOpen(true);
                setError("")
                setFormState(0)
                setPassword("")
            }
        } catch (err) {
            const responseMessage = err?.response?.data?.message;
            setError(typeof responseMessage === "string"
                ? responseMessage
                : "Unable to authenticate. Please check your connection and try again.");
        } finally {
            setSubmitting(false);
        }
    }


    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" className="authPage">
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    className="authVisualPanel"
                >
                    <h1>Good conversations bring us closer.</h1>
                    <p>A calmer, more personal space for the people and teams who matter.</p>
                </Grid>
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={0} square className="authFormPanel">
                    <BackButton fallback="/" className="authBackButton" />
                    <Box
                        className="authFormContent"
                        sx={{
                            my: { xs: 3, sm: 6 },
                            mx: { xs: 2, sm: 4 },
                            py: { xs: 2, sm: 0 },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>

                        <Typography component="h1" className="authWelcome">
                            {formState === 0 ? "Welcome back" : "Create your account"}
                        </Typography>
                        <Typography className="authSubheading">
                            {formState === 0
                                ? "Sign in to pick up right where you left off."
                                : "Join LetsMeets and bring everyone a little closer."}
                        </Typography>

                        <div className="authModeSwitch" role="group" aria-label="Choose sign in or sign up">
                            <Button
                                className={formState === 0 ? "active" : ""}
                                aria-pressed={formState === 0}
                                disabled={submitting}
                                onClick={() => {
                                    setFormState(0);
                                    setError("");
                                }}
                            >
                                Sign In
                            </Button>
                            <Button
                                className={formState === 1 ? "active" : ""}
                                aria-pressed={formState === 1}
                                disabled={submitting}
                                onClick={() => {
                                    setFormState(1);
                                    setError("");
                                }}
                            >
                                Sign Up
                            </Button>
                        </div>

                        <Box component="form" onSubmit={handleAuth} sx={{ mt: 1, width: '100%' }}>
                            {formState === 1 ? <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="full-name"
                                label="Full Name"
                                name="name"
                                value={name}
                                autoFocus
                                autoComplete="name"
                                inputProps={{ maxLength: 80 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonOutlineRoundedIcon className="authInputAdornment" />
                                        </InputAdornment>
                                    )
                                }}
                                onChange={(e) => setName(e.target.value)}
                            /> : <></>}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                value={username}
                                autoFocus={formState === 0}
                                autoComplete="username"
                                inputProps={{ maxLength: 80 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonOutlineRoundedIcon className="authInputAdornment" />
                                        </InputAdornment>
                                    )
                                }}
                                onChange={(e) => setUsername(e.target.value)}

                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                value={password}
                                type={showPassword ? "text" : "password"}
                                autoComplete={formState === 0 ? "current-password" : "new-password"}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlinedIcon className="authInputAdornment" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                className="passwordVisibilityButton"
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                onClick={() => setShowPassword(current => !current)}
                                            >
                                                {showPassword
                                                    ? <VisibilityOffOutlinedIcon fontSize="small" />
                                                    : <VisibilityOutlinedIcon fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                                onChange={(e) => setPassword(e.target.value)}

                                id="password"
                            />

                            {error && <p className="authError" role="alert">{error}</p>}

                            <Button
                                className="authSubmitButton"
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mb: 2 }}
                                disabled={submitting}
                            >
                                {submitting
                                    ? (formState === 0 ? "Signing in..." : "Creating account...")
                                    : (formState === 0 ? "Login" : "Register")}
                            </Button>

                        </Box>
                    </Box>
                </Grid>
            </Grid>

            <Snackbar

                open={open}
                autoHideDuration={4000}
                message={message}
                onClose={() => setOpen(false)}
            />

        </ThemeProvider>
    );
}