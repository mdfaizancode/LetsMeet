import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useThemeMode } from '../contexts/ThemeModeContext';

export default function ThemeModeToggle({ className = '' }) {
    const { mode, toggleMode } = useThemeMode();
    const nextMode = mode === 'light' ? 'dark' : 'light';
    const label = `Switch to ${nextMode} mode`;

    return (
        <Tooltip title={label}>
            <IconButton
                className={`themeModeToggle ${className}`.trim()}
                onClick={toggleMode}
                aria-label={label}
                aria-pressed={mode === 'dark'}
            >
                {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
            </IconButton>
        </Tooltip>
    );
}
