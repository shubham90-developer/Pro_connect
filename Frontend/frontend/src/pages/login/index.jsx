import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styles from './login.module.css'
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser } from '@/config/redux/action/authAction';
import { emptyMessage } from '@/config/redux/reducer/authReducer';
import Layout from '@/layout/userlayout/userlayout';

function Login(){
    const router = useRouter();
    const [isLoginMethod ,SetisLoginMethod] = useState(false);
    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth);

    const [name ,setName] = useState("");
    const [username ,setUsername] = useState("");
    const [email ,setEmail] = useState("");
    const [password ,setPassword] = useState("");

    useEffect(()=>{
        console.log("regestring");
        if(authState.isLoggedIn){
            router.push('/dashboard');
        }
    },[authState.isLoggedIn]);
    
    useEffect(()=>{
        dispatch(emptyMessage());
    },[isLoginMethod]);

    useEffect(()=>{
        if(localStorage.getItem('token')){
            router.push("/dashboard");
        }
    })

    const handleRegister = () => {
        dispatch(registerUser({name, username, email, password}));
        setName("");
        setUsername("");
        setEmail("");
        setPassword("");
    };

    const handleLogin = ()=>{
        dispatch(loginUser({email,password}));
        setEmail("");
        setPassword("");
    }

    return(
        <Layout>
            <div className={styles.mainContainer}>
                <div className={styles.leftContainer}>
                    <p className={styles.paragraph}>{isLoginMethod ? "Sign in" : "Signup"}</p>
                    <p style={{color:authState.isError?"red":"green"}}>{authState.message.message}</p>
                    
                    <div className={styles.inputContainer}>
                        {!isLoginMethod && (
                            <div className={styles.row}>
                                <input
                                    className={styles.inputField}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    type="text"
                                    placeholder="Username"
                                />
                                <input
                                    className={styles.inputField}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    type="text"
                                    placeholder="Name"
                                />
                            </div>
                        )}
                        <input
                            className={styles.inputField}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="Email"
                        />
                        <input
                            className={styles.inputField}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="Password"
                        />
                    </div>

                    <div
                        className={styles.button}
                        onClick={() => {
                            if (isLoginMethod) {
                                handleLogin();
                            } else {
                                handleRegister();
                            }
                        }}
                    >
                        <p>{isLoginMethod ? "Sign in" : "Sign up"}</p>
                    </div>
                </div>

                <div className={styles.rightContainer}>
                    <div>
                        <div>
                            {isLoginMethod ? (
                                <p className={styles.paragraph}>Don't have an account?</p>
                            ) : (
                                <p className={styles.paragraph}>Already have an account?</p>
                            )}
                        </div>
                        <div
                            className={styles.button}
                            onClick={() => {
                                SetisLoginMethod(!isLoginMethod);
                            }}
                        >
                            <p>{!isLoginMethod ? "Sign in" : "Sign up"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Login;
