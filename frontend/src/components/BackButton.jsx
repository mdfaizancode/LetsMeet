import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';

export default function BackButton({ fallback = '/', onBack, className = '' }) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (window.history.state?.idx > 0) {
            navigate(-1);
        } else {
            navigate(fallback);
        }
    };

    return (
        <Tooltip title="Go back">
            <IconButton
                className={`pageBackButton ${className}`.trim()}
                aria-label="Go back"
                onClick={handleBack}
            >
                <ArrowBackRoundedIcon />
            </IconButton>
        </Tooltip>
    );
}
