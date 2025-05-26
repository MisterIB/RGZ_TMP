import React from "react";
import { useState } from 'react'
import './SignUp.css'

const SignInRegister = ({ signIn, register }) => {
  const [showSignIn, setShowSignIn] = useState(true)

  return (
    showSignIn ?
      <SignIn
        signIn={signIn}
        setShowSignIn={setShowSignIn}
      />
    : <Register
        register={register}
        setShowSignIn={setShowSignIn}
      />
  )
}

const SignIn = ({ signIn, setShowSignIn }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = event => {
    event.preventDefault()
    signIn(username, password)
  }
  
  return (
    <div className="SignIn">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={event => setUsername(event.target.value)}
          placeholder="username"
        />
        <input
          type="password"
          value={password}
          onChange={event => setPassword(event.target.value)}
          placeholder="password"
        />
        <input type="submit" value="Sign In"/>
      </form>
      <p>Don't have an account? <button className="reg-button" onClick={e => setShowSignIn(false)}>Register</button></p>
    </div>
  )
}

const Register = ({ register, setShowSignIn }) => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = event => {
    event.preventDefault()
    register(username, email, password)
  }
  
  return (
    <div className="Register">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={event => setUsername(event.target.value)}
          placeholder="username"
        />
        <input
          type="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          placeholder="email"
        />
        <input
          type="password"
          value={password}
          onChange={event => setPassword(event.target.value)}
          placeholder="password"
        />
        <input type="submit" value="Register"/>
      </form>
      <p>Already have an account? <button className="sig-button" onClick={e => setShowSignIn(true)}>Sign In</button></p>
    </div>
  )
}

export default SignInRegister