import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import './OnboardControl.css'

const OnboardControl = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [ocs, setOcs] = useState('')
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        const fetchOCS = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/onboard_control/${id}`, { withCredentials: true, credentials: 'include'})
                setOcs(response.data)
            } catch (err) {
                console.log(err)
                alert('Ошибка при получении данных')
                navigate('/profile')
            }
        };

        fetchOCS()
    }, [id])

    const handleSave = async () => {
        try {
            await axios.put(`http://localhost:5000/onboard_control/${id}`, ocs, { withCredentials: true, credentials: 'include' })
            setIsEditing(false)
        } catch (err) {
            console.log(err)
            alert('Ошибка при сохранении')
        }
    }

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleCancel = () => {
        setIsEditing(false)
    }

    return (
        <div className="ocs-container">
            <h2>Бортовая система контроля</h2>
            <div className="ocs-data">
                <div className="data-item">
                    <strong>Модель:</strong>
                    {isEditing ? (
                        <input
                            type="text"
                            value={ocs.model}
                            onChange={(e) => setOcs({...ocs, model: e.target.value })}/>
                    ) : ocs.model}
                </div>
                <div className="data-item">
                    <strong>Состояние тормозных колодок:</strong>
                    {isEditing ? (
                        <select 
                            value={ocs.brake_linings_status}
                            onChange={(e) => setOcs({...ocs, brake_linings_status: e.target.value })}>
                            <option value="good">Хорошее</option>
                            <option value="normal">Нормальное</option>
                            <option value="low">Низкое</option>
                        </select>
                    ) : ocs.brake_linings_status}
                </div>
                <div className="data-item">
                    <strong>Уровень моторного масла:</strong>
                    {isEditing ? (
                        <select 
                            value={ocs.engine_oil_level}
                            onChange={(e) => setOcs({...ocs, engine_oil_level: e.target.value })}>
                            <option value="normal">Нормальный</option>
                            <option value="low">Низкий</option>
                        </select>
                    ) : ocs.engine_oil_level}
                </div>
                <div className="data-item">
                    <strong>Уровень тормозной жидкости:</strong>
                    {isEditing ? (
                        <select 
                            value={ocs.brake_fluid_level}
                            onChange={(e) => setOcs({...ocs, brake_fluid_level: e.target.value })}>
                            <option value="full">Полный</option>
                            <option value="low">Низкий</option>
                        </select>
                    ) : ocs.brake_fluid_level}
                </div>
                <div className="data-item">
                    <strong>Уровень трансмиссионной жидкости:</strong>
                    {isEditing ? (
                        <select 
                            value={ocs.transmission_fluid_level}
                            onChange={(e) => setOcs({...ocs, transmission_fluid_level: e.target.value })}>
                            <option value="full">Полный</option>
                            <option value="low">Низкий</option>
                        </select>
                    ) : ocs.transmission_fluid_level}
                </div>
                <div className="data-item">
                    <strong>Уровень охлаждающей жидкости:</strong>
                    {isEditing ? (
                        <select 
                            value={ocs.coolant_level}
                            onChange={(e) => setOcs({...ocs, coolant_level: e.target.value })}>
                            <option value="full">Полный</option>
                            <option value="low">Низкий</option>
                        </select>
                    ) : ocs.coolant_level}
                </div>
                <div className="data-item">
                    <strong>Состояние фильтров:</strong>
                    {isEditing ? (
                        <select 
                            value={ocs.filter_status}
                            onChange={(e) => setOcs({...ocs, filter_status: e.target.value })}>
                            <option value="clean">Чистые</option>
                            <option value="normal">Нормальные</option>
                            <option value="dirty">Загрязненные</option>
                        </select>
                    ) : ocs.filter_status}
                </div>
                <div className="data-item">
                    <strong>Состояние приборных ламп:</strong>
                    {isEditing ? (
                        <select 
                            value={ocs.instrument_lamps_status}
                            onChange={(e) => setOcs({...ocs, instrument_lamps_status: e.target.value })}>
                            <option value="working">Работают</option>
                            <option value="blinking">Мигают</option>
                            <option value="broken">Не работают</option>
                        </select>
                    ) : ocs.instrument_lamps_status}
                </div>
                <div className="button-group">
                    {!isEditing ? (
                        <button className="edit-button" onClick={handleEdit}>Редактировать</button>
                        ) : (
                            <>
                            <button className="save-button" onClick={handleSave}>Сохранить</button>
                            <button className="back-button" onClick={handleCancel}>Отмена</button>
                            </>
                            )}
                </div>
            </div>
        </div>
    )}
    
export default OnboardControl