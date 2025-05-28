import React, { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import './RouteComputer.css'

const RouteComputer = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [rc, setRc] = useState('')
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        const fetchRC = async () => {
        try {
            const response = await axios.get(`http://217.71.129.139:5675/route_computer/${id}`, { withCredentials: true, credentials: 'include' });
            setRc(response.data)
        } catch (err) {
            console.log(err)
            alert('Ошибка при получении данных')
            navigate('/profile')
        }};
        if (id) {
            fetchRC()
        }
        }, id)

    const handleSave = async () => {
    try {
        await axios.put(`http://217.71.129.139:5675/route_computer/${id}`, rc, { withCredentials: true, credentials: 'include' })
        setIsEditing(false)
    } catch (err) {
        console.log(err)
        alert('Ошибка при сохранении')
    }}

    return (
        <div className="rc-container">
            <h2>Маршрутный компьютер</h2>
            <div className="rc-data">
                <div className="data-item">
                    <strong>Модель:</strong>
                    {isEditing ? (
                    <input type="text" value={rc.model} onChange={(e) => setRc({ ...rc, model: e.target.value })}/>
                    ) : rc.model}
                </div>
                <div className="data-item">
                    <strong>Расход топлива:</strong>
                    {isEditing ? (
                    <input type="number" value={rc.fuel_consumption} onChange={(e) => setRc({ ...rc, fuel_consumption: e.target.value })}/>
                    ) : rc.fuel_consumption}
                </div>
                <div className="data-item">
                    <strong>Пробег:</strong>
                    {isEditing ? (
                    <input type="number" value={rc.mileage} onChange={(e) => setRc({ ...rc, mileage: e.target.value })}/>
                    ) : rc.mileage}
                </div>
            </div>
            <div className="buttons">
            {isEditing ? (
            <>
            <button className="first-btn" onClick={handleSave}>Сохранить</button>
            <button className="second-btn" onClick={() => setIsEditing(false)}>Отмена</button>
            </>
            ) : (
            <button className="btn" onClick={() => setIsEditing(true)}>Редактировать</button>
            )}
            <Link to="/profile" className="back-button">
            Назад
            </Link>
        </div>
    </div>
);};

export default RouteComputer;