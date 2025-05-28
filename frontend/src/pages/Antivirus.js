import React, { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import './Antivirus.css'

const Antivirus = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [antivirus, setAntivirus] = useState({})
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        const fetchAntivirus = async () => {
            try {
                const response = await axios.get(`http://217.71.129.139:5675/antivirus/${id}`, { withCredentials: true, credentials: 'include' })
                setAntivirus(response.data)
            } catch (err) {
                console.log(err)
                alert('Ошибка при получении данных')
                navigate('/profile')
            }
        };
        if (id) {
            fetchAntivirus()
        }
    }, [id]);

    const handleSave = async () => {
        try {
            await axios.put(`http://217.71.129.139:5675/antivirus/${id}`, antivirus, { withCredentials: true, credentials: 'include' })
            setIsEditing(false)
        } catch (err) {
            console.log(err)
            alert('Ошибка при сохранении')
        }
    };

    return (
        <div className="antivirus-container">
            <h2>Информация об антивирусе</h2>
            <div className="antivirus-data">
                <div className="data-item">
                    <strong>Версия:</strong>
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={antivirus.version} 
                            onChange={(e) => setAntivirus({ ...antivirus, version: e.target.value })}
                        />
                    ) : antivirus.version}
                </div>
                <div className="data-item">
                    <strong>Дата обновления:</strong>
                    {isEditing ? (
                        <input 
                            type="datetime-local" 
                            value={antivirus.update_data} 
                            onChange={(e) => setAntivirus({ ...antivirus, update_data: e.target.value })}
                        />
                    ) : new Date(antivirus.update_data).toLocaleString()}
                </div>
                <div className="data-item">
                    <strong>Статус:</strong>
                    {isEditing ? (
                        <select 
                            value={antivirus.status} 
                            onChange={(e) => setAntivirus({ ...antivirus, status: e.target.value })}
                        >
                            <option value="active">Активный</option>
                            <option value="inactive">Неактивный</option>
                        </select>
                    ) : antivirus.status}
                </div>
                <div className="data-item">
                    <strong>Дата последнего сканирования:</strong>
                    {isEditing ? (
                        <input 
                            type="datetime-local" 
                            value={antivirus.last_scan_data} 
                            onChange={(e) => setAntivirus({ ...antivirus, last_scan_data: e.target.value })}
                        />
                    ) : new Date(antivirus.last_scan_data).toLocaleString()}
                </div>
                <div className="data-item">
                    <strong>Результат последнего сканирования:</strong>
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={antivirus.last_scan_result} 
                            onChange={(e) => setAntivirus({ ...antivirus, last_scan_result: e.target.value })}
                        />
                    ) : antivirus.last_scan_result}
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
            <Link to="/profile" className="back-button">Назад</Link>
            </div>
        </div>
);};

export default Antivirus;