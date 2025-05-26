import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import './Detail.css'

const Detail = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const [name,setName] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    const [status,setStatus] = useState('');
    const [errors, setErrors] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchDeviceData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/items/${id}`, {withCredentials: true, credentials: 'include'});
                const { name, manufacturer, status, errors } = response.data;
                setName(name);
                setManufacturer(manufacturer);
                setStatus(status);
                setErrors(errors);
            } catch (error) {
                console.error("Ошибка при загрузке информации о детали: ", error);
            }
        };

        fetchDeviceData();
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm("Вы уверены, что хотите удалить?")) {
            try {
                await axios.delete(`http://localhost:5000/items/${id}`, {withCredentials: true, credentials: 'include'});
                navigate("/details");

            } catch (error) {
                console.error("Ошибка при удалении компонента: ", error);
            }
        }
    };

    const handleSave = async () => {
        try {
            await axios.put(`http://localhost:5000/items/${id}`, { name, manufacturer, status, errors }, {withCredentials: true, credentials: 'include'});
            setIsEditing(false);
        } catch (error) {
            console.error("Ошибка при обновлении информации о детали: ", error);
        }
    }

    return (
        <div className="detail_page">
          <h1>Информация о детали автомобиля</h1>
          <div className="detail_info">
            <label>
              Название:{" "}
              <strong>{name}</strong>
            </label>
            <br />
            <label>
              Производитель:{" "}
              <strong>{manufacturer}</strong>
            </label>
            <br />
            <label>
              Статус:{" "}
              <strong>{status}</strong>
            </label>
            <br />
            <label>
              Ошибки:{" "}
              <strong>{errors}</strong>
            </label>
          </div>
    
          <div className="buttons_group">
            <button onClick={() => navigate("/details")}>Назад</button>
            <button onClick={handleDelete}>
              Удалить
            </button>
            <button onClick={() => setIsEditing(true)}>
              Изменить
            </button>
          </div>
    
          {isEditing && (
            <div className="edit_form">
              <h1>Редактирование информации</h1>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
              >
                <label>
                  Новое имя:
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </label>
                <br />
                <label>
                  Производитель:
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    required
                  />
                </label>
                <br />
                <label>
                  Статус:
                  <input
                    type="text"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                  />
                </label>
                <br />
                <label>
                  Ошибки:
                  <input
                    type="text"
                    value={errors}
                    onChange={(e) => setErrors(e.target.value)}
                    required
                  />
                </label>
                <br />
                <button type="submit">Сохранить</button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                >
                  Отмена
                </button>
              </form>
            </div>
          )}
        </div>
      );
};

export default Detail;