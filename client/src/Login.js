import { useState } from 'react';
import SignUpForm from "./SignUpForm"
import uno from './assets/logo.png'
import cat from './assets/cat_icon.jpg'
function Login({ onLogin, setProfilePicture }) {
    const [showLogin, setShowLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);
        fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        }).then((r) => {
            setIsLoading(false);
            if (r.ok) {
                r.json().then((user) => {
                    onLogin(user)
                    if (user.profile_picture) {
                        setProfilePicture(user.profile_picture)
                    }
                    else {
                        setProfilePicture(cat)
                    }
                });
            } else {
                r.json().then((err) => {
                    let allErrors = [];
                    if ("errors" in err) {
                        allErrors = [...err.errors]
                    }
                    if ("error" in err) {
                        allErrors.push(err.error)
                    }
                    setErrors(allErrors)
                });
            }
        });
    }

    return (
        <div className='Login'>
            <div><img src={uno} style={{ width: "200px", height: "150px" }} /> </div>
            {showLogin ? (
                <>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username">Username </label>
                            <input
                                type="text"
                                id="username"
                                autoComplete="off"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password">Password </label>
                            <input
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <button variant="fill" color="primary" type="submit">
                                {isLoading ? "Loading..." : "Login"}
                            </button>
                        </div>
                        <div>
                            {errors.map((err) => (
                                <div>{err}</div>
                            ))}
                        </div>
                    </form>
                    <hr />
                    <p>
                        Don't have an account? &nbsp;
                        <button color="secondary" onClick={() => setShowLogin(false)}>
                            Sign Up
                        </button>
                    </p>
                </>
            ) : (
                <>
                    <SignUpForm onLogin={onLogin} setProfilePicture={setProfilePicture} />
                    <hr />
                    <p>
                        Already have an account? &nbsp;
                        <button color="secondary" onClick={() => setShowLogin(true)}>
                            Log In
                        </button>
                    </p>
                </>
            )}
        </div>
    );
}

export default Login;
