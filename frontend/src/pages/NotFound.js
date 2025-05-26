import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div>
        <h1 style={{ color: 'darkblue'}}>Ошибка 404 (Страница не найдена) </h1>
        <Link to="/">Вернуться на главную страницу</Link> 
        </div>
    );
}

export default NotFound;