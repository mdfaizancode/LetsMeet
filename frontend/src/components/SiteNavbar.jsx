import Button from '@mui/material/Button';
import RestoreIcon from '@mui/icons-material/Restore';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeModeToggle from './ThemeModeToggle';

const publicRoutes = new Set(['/', '/auth', '/home', '/history']);

export default function SiteNavbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const isLandingPage = location.pathname === '/';
    const isMeetingPage = !publicRoutes.has(location.pathname);
    const isSignedIn = Boolean(localStorage.getItem('token'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/auth');
    };

    return (
        <header className={`siteNavbar${isLandingPage ? ' siteNavbarLanding' : ''}${isMeetingPage ? ' siteNavbarMeeting' : ''}`}>
            <Link className="siteNavbarBrand" to={isSignedIn ? "/home" : "/"} aria-label="LetsMeets home">
                <span className="siteNavbarMark" aria-hidden="true" />
                <span>LetsMeets</span>
            </Link>

            <nav className="siteNavbarActions" aria-label="Main navigation">
                {isLandingPage && (
                    <>
                        <Link className="siteNavbarTextLink guestLink" to="/aljk23">Join as Guest</Link>
                        <Link className="siteNavbarTextLink registerLink" to="/auth">Register</Link>
                        <Link className="siteNavbarLoginLink" to="/auth">Login</Link>
                        <ThemeModeToggle />
                    </>
                )}

                {location.pathname === '/home' && isSignedIn && (
                    <>
                        <ThemeModeToggle />
                        <Button
                            className="siteNavbarHistory"
                            startIcon={<RestoreIcon />}
                            onClick={() => navigate('/history')}
                            aria-label="Meeting history"
                        >
                            <span className="historyLabel">History</span>
                        </Button>
                        <Button onClick={handleLogout}>Logout</Button>
                    </>
                )}

                {location.pathname === '/history' && <ThemeModeToggle />}
                {location.pathname === '/auth' && <ThemeModeToggle />}
                {isMeetingPage && <ThemeModeToggle />}
            </nav>
        </header>
    );
}
