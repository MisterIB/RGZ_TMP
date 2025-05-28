exports.options = () => {
    return {
        // Определения для Swagger'a
        swaggerDefinition: {
            // Блок информации
            info: {
                description: 'Данный сервис определяет основные пользовательские функции',  // Описание
                title: 'Основной сервис',                                           // Название
                version: '1.0.0',                                                           // Версия
                contact: {                                                                  // Контакты
                    email: "swdaniel@yandex.ru"
                }
            },
            host: 'localhost:5000',                                                         // Основной хост
            basePath: '/',                                                                  // Базовый путь
            produces: [                                                                     
                "application/json",
                "application/xml"
            ],
            schemes: ['http', 'https'],
            securityDefinitions: {                                                          // Определения безопасности
                JWT: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization',
                    description: "",
                }
            },
            externalDocs: {                                                                 // Ссылка на внешнюю документацию
                description: 'Ссылка на внешнюю документацию',
                url: 'http://localhost:5000/api-docs'
            },
        },
        // Маршрут, по которому будет доступна документация в браузере
        route: {
            url: '/doc/swagger2',
            docs: '/swagger.json',
        },
        basedir: '/home/igor/Documents/laba4',
        // Файлы, которые будут просматриваться генератором и которые будут влиять на конечный результат
        files: ['./routes/*.js', './db/*.js', './middleware/*.js', 'app.js']
    };
}