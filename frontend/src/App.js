import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LandingPage from './pages/landing';
import Authentication from './pages/authentication';
import { AuthProvider } from './contexts/AuthContext';
import VideoMeetComponent from './pages/VideoMeet';
import HomeComponent from './pages/home';
import History from './pages/history';
import { ThemeModeProvider } from './contexts/ThemeModeContext';
import SiteNavbar from './components/SiteNavbar';
import withAuth from './utils/withAuth';

const ProtectedHistory = withAuth(History);

function App() {
  return (
    <div className="App">

      <Router>

        <ThemeModeProvider>
          <AuthProvider>
            <SiteNavbar />

            <Routes>

              <Route path='/' element={<LandingPage />} />

              <Route path='/auth' element={<Authentication />} />

              <Route path='/home' element={<HomeComponent />} />
              <Route path='/history' element={<ProtectedHistory />} />
              <Route path='/:url' element={<VideoMeetComponent />} />
            </Routes>
          </AuthProvider>
        </ThemeModeProvider>

      </Router>
    </div>
  );
}

export default App;
