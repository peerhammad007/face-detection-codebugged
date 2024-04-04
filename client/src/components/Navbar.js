import {useContext, useEffect} from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import BASE_URL from '../config';

const Navbar = () => {
    const {setUserInfo, userInfo} = useContext(UserContext);
    const navigate = useNavigate();
    useEffect(() => {
        axios.get(`${BASE_URL}/profile`, {
            withCredentials: true
        })
        .then(response => {
            console.log(response.data);
            setUserInfo(response.data);
        })
        .catch(error => {
            console.error('Error fetching profile:', error);
        });
    }, []);
    
    function logout() {
        axios.post(`${BASE_URL}/logout`, {}, {
            withCredentials: true
        })
        .then(() => {
            setUserInfo(null);
            navigate('/');
        })
        .catch(error => {
            console.error('Error logging out:', error);
        });
    }

    const username = userInfo?.username;

    return (
        <header className="navbar">
            <Link to="/home" className="logo">Face Detector</Link>
            <nav>
                {username ? (
                    <a className="nav-link" onClick={logout}>Logout</a>
                ) : (
                    <>
                        <Link to="/" className="nav-link">Login</Link>
                        <Link to="/register" className="nav-link">Register</Link>
                    </>
                )}
            </nav>
        </header>
    )
}

export default Navbar