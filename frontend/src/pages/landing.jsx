import React from 'react'
import "../App.css"
import { Link } from 'react-router-dom'
export default function LandingPage() {

    return (
        <div className='landingPageContainer'>
            <div className="landingMainContainer">
                <div>
                    <h1><span className="heroAccent">Connect</span> with your loved ones</h1>

                    <p>Meet face-to-face, wherever life takes you.</p>
                    <Link className="landingCta" to="/auth">Get Started</Link>
                </div>
                <div>

                    <img src="/mobile.png" alt="Video call preview on a mobile phone" />

                </div>
            </div>



        </div>
    )
}
