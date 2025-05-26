import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import './carDetails.css';

const Home = () => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async() => {
            try {
                const response = await axios.get("http://localhost:5000/items", {withCredentials: true, credentials: 'include'});
                setData(response.data);
                setLoading(false)
                console.log("Данные загружены: ", response.data);
            } catch (error) {
                console.error("Ошибка запроса: ", error);
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <div className="main_page">
            <h1>Диагностика автомобиля</h1>
            <ul>
                {data.map(item => (
                    <li key={item.id}>
                        <Link to={`/detail/${item.id}`}>{item.name}</Link>
                    </li>
                ))}
            </ul>
            <Link 
                to="/add" 
                className="add-button">
                Добавить деталь
            </Link>
        </div>
    );
};

export default Home;