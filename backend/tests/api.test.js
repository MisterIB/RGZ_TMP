const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authConfig = require('../config/auth.config');

// Создаем фиктивного пользователя для тестов
const testUser = {
  username: 'igor',
  email: 'test@test.com',
  password: '123',
  hashedPassword: bcrypt.hashSync('123', 10),
  access_right: 'user'
};

// Создаем валидный JWT токен для тестов
const generateToken = () => {
  return jwt.sign({ id: 1, role: testUser.access_right }, authConfig.secret(), { expiresIn: '24h' });
};

describe('Auth and Car API Tests', () => {

  // Тест авторизации с неверным паролем
  test('POST /signin should return 401 for invalid password', async () => {
    const response = await request(app)
      .post('/signin')
      .send({
        username: testUser.username,
        password: 'wrongpassword'
      });
    
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Неверный пароль!');
  });

  // Тест получения списка автомобилей (требуется авторизация)
  test('GET /cars should return list of cars', async () => {
    const token = generateToken();
    const response = await request(app)
      .get('/cars')
      .set('Cookie', `access_token=${token}`);
    
    expect(response.status).toBe(200);
  });

  // Тест добавления автомобиля
  test('POST /cars should create new car', async () => {
    const token = generateToken();
    const response = await request(app)
      .post('/cars')
      .set('Cookie', `access_token=${token}`)
      .send({
        model: 'Test Model',
        plate: '123ABC',
        color: 'Red',
        RCmodel: 'Test RC',
        MDSmodel: 'Test MDS',
        OCSmodel: 'Test OCS',
        AVversion: 'Test AV',
        userId: 1
      });
    
    expect(response.status).toBe(201);
  });

  // Тест удаления автомобиля
  test('DELETE /cars should delete car', async () => {
    const token = generateToken();
    const response = await request(app)
      .delete('/cars')
      .query({ carId: 1 })
      .set('Cookie', `access_token=${token}`);
 
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Автомобиль успешно удален');
      });
     
     // Тест обновления информации о маршрутном компьютере
     test('PUT /route_computer/:id should update route computer', async () => {
      const token = generateToken();
      const response = await request(app)
      .put('/route_computer/3')
      .set('Cookie', `access_token=${token}`)
      .send({
      model: 'Updated RC Model',
      fuel_consumption: 10,
      mileage: 50000
      });
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Данные успешно обновлены');
     });
     
     
     // Тест неавторизованного доступа к защищенному маршруту
     test('GET /cars without token should return 401', async () => {
      const response = await request(app)
      .get('/cars');
      
      expect(response.status).toBe(403);
     });
     
     // Тест с некорректным токеном
     test('GET /cars with invalid token should return 401', async () => {
      const response = await request(app)
      .get('/cars')
      .set('Cookie', 'access_token=invalid_token');
      
      expect(response.status).toBe(401);
     });
})