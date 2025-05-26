import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import './MeasuringSystem.css'

const MeasuringDeviceSystem = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [mds, setMds] = useState('')
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        const fetchMDS = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/measuring_device/${id}`, { withCredentials: true, credentials: 'include' })
                setMds(response.data)
            } catch (err) {
                console.log(err)
                alert('Ошибка при получении данных')
                navigate('/profile')
            }
        };
        if (id) {
            fetchMDS()
        }
    }, [id])

    const handleSave = async () => {
        try {
            await axios.put(`http://localhost:5000/measuring_device/${id}`, mds, { withCredentials: true, credentials: 'include' })
            setIsEditing(false)
        } catch (err) {
            console.log(err)
            alert('Ошибка при сохранении')
        }
    }

    return (
        <div className="mds-container">
            <h2>Система измерительных приборов</h2>
            <div className="mds-data">
                <div className="data-item">
                    <strong>Модель:</strong>
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={mds.model} 
                            onChange={(e) => setMds({ ...mds, model: e.target.value })}
                        />
                    ) : mds.model}
                </div>
                <div className="data-item">
                    <strong>Количество топлива (л):</strong>
                    {isEditing ? (
                        <input 
                            type="number" 
                            value={mds.fuel_quantity} 
                            onChange={(e) => setMds({ ...mds, fuel_quantity: e.target.value })}
                        />
                    ) : mds.fuel_quantity}
                </div>
                <div className="data-item">
                    <strong>Температура охлаждающей жидкости (°C):</strong>
                    {isEditing ? (
                        <input 
                            type="number" 
                            value={mds.coolant_temperature} 
                            onChange={(e) => setMds({ ...mds, coolant_temperature: e.target.value })}
                        />
                    ) : mds.coolant_temperature}
                </div>
                <div className="data-item">
                    <strong>Давление масла (бар):</strong>
                    {isEditing ? (
                        <input 
                            type="number" 
                            value={mds.oil_pressure} 
                            onChange={(e) => setMds({ ...mds, oil_pressure: e.target.value })}
                        />
                    ) : mds.oil_pressure}
                </div>
            </div>
            <div className="button-group">
                {isEditing ? (
                    <>
                        <button className="btn btn-primary" onClick={handleSave}>
                            Сохранить
                        </button>
                        <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                            Отмена
                        </button>
                    </>
                ) : (
                    <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                        Редактировать
                    </button>
                )}
            </div>
        </div>
    );
};

export default MeasuringDeviceSystem