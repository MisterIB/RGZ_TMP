import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import SignInRegister from "./SignUp"

const Login = () => {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  const register = async (username, email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/register', {username, email, password}, {withCredentials: true, credentials: 'include'})  
      navigate('/profile')
    } catch (err) {
        console.log(err)
        alert('Ошибка при регистрации')
    }
  }
  
  const signIn = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:5000/signin', {username, password}, {withCredentials: true, credentials: 'include'})
      setUser(response.data)
      localStorage.clear('user')
      localStorage.setItem('user', JSON.stringify(response.data))
    } catch (err) {
        console.log(err)
        alert('Ошибка при входе')
    }
  }
  
  return (
    <div className="App">
      {
        user === null ?
        <SignInRegister
          signIn={signIn}
          register={register}
        />
        : navigate('/profile')
      }
    </div>
  )
}

export default Login