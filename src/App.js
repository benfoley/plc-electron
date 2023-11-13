import React, { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import './App.css';
import SearchBar from './components/SearchBar';
import ResultsPanel from './components/ResultsPanel';

// https://blog.logrocket.com/guide-adding-google-login-react-app/

function App() {
    const [ user, setUser ] = useState([]);
    const [ profile, setProfile ] = useState([]);

    const login = useGoogleLogin({
      onSuccess: (codeResponse) => setUser(codeResponse),
      onError: (error) => console.log('Login Failed:', error)
    });

    const logOut = () => {
        googleLogout();
        setProfile(null);
    };

    // componentDidMount
    useEffect(logOut, []);

    // componentDidUpdate(dependency)
    useEffect(() => {
        if (user) {
            fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                headers: {
                    Authorization: `Bearer ${user.access_token}`,
                    Accept: 'application/json'
                }
            })
            .then(res => res.json())
            .then(res => setProfile(res))
            .catch(err => console.log(err));
        }
    }, [ user ]);

    return (
      <div className="App">
        <header className="App-header">
          <SearchBar />
        </header>
        {profile && profile.name ? (
            <div>
                <img src={profile.picture} alt="user image" />
                <h3>User Logged in</h3>
                <p>Name: {profile.name}</p>
                <p>Email Address: {profile.email}</p>
                <br />
                <br />
                <button onClick={logOut}>Log out</button>
            </div>
        ) : (
            <button onClick={() => login()}>Sign in with Google</button>
        )}

        <ResultsPanel />
      </div>
    );
}

export default App;
