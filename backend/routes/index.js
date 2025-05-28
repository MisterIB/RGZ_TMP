var express = require('express');
var router = express.Router();
const db = require('../db/db');
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const jwt = require ('jsonwebtoken');
const authConfig = require('../config/auth.config')
const authJwt = require('../middleware/authjwt');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres', 
    host: 'localhost', 
    database: 'postgres', 
    password: '080906', 
    port: 5432, 
  });  

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/**
 * @swagger
 * /signin:
 *  post:
 *     description: Используется для входа пользователем в систему
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             example: 
 *                 {
 *                 "id": 2,
 *                 "username": "igor",
 *                 "email": "igor@mail.ru"
 *                 }
 *       400:
 *         description: Не удалось войти
 *         content:
 *           application/json:
 *             example: {error: true, message: 'Не удалось войти'}
 */

router.post('/signin', async (req, res) => {
  try {
    
    const user = await db.getUser(req.body.username)
    if (user === null) {
      await pool.query('INSERT INTO log (id_source, data, type, message) VALUES ($3, NOW(), $1, $2);', ['auth', 'Ошибка входа: пользователь не найден', req.ip]); 
      throw 'Не удалось получить информацию о пользователе';
    }
    if (!bcrypt.compareSync(req.body.password, user.hash_password))
      return res.status(401).json({
      accessToken: null,
      message: "Неверный пароль!",
  });

  const token = jwt.sign({ id: user.id,  role: user.access_right}, authConfig.secret(), {
    expiresIn: 86400, // 24 hours
  });

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict'
    }).send({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.access_right,
    })
    res.status(200)
    await pool.query('INSERT INTO log (id_source, data, type, message) VALUES ($1, NOW(), $2, $3)', [req.ip, 'auth', 'Успешный вход']);
  } catch(err) {
    console.log(err)
    await pool.query('INSERT INTO log (id_source, data, type, message) VALUES ($3, NOW(), $1, $2)', ['error', 'Ошибка входа: ' + err.message, req.ip]);
    res.status(400).send({error: true, message: `Не удалось войти`})
  }
});

/**
 * @swagger
 * /register:
 *  post:
 *     description: Используется для регистрации пользователя в системе
 *     responses:
 *       201:
 *         description: Успешная регистрация
 *         content:
 *           application/json:
 *             example: {error: false, message: 'Регистрация прошла успешно'}
 *       400:
 *         description: Не удалось зарегистрироваться
 *         content:
 *           application/json:
 *             example: {error: true, message: 'Не удалось зарегистрироваться'}
 */

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body
    const hashedPassword = bcrypt.hashSync(password, 10)
    
    const user = await db.createUser(username, email, hashedPassword)
    if (user === null) {
      await зщщд.query('INSERT INTO log (data, type, message) VALUES (NOW(), $1, $2)', ['error', 'Ошибка регистрации']);
      throw `Не удалось зарегистрировать пользователя`
    }
    await pool.query('INSERT INTO log (data, type, message) VALUES (NOW(), $1, $2)', ['user', 'Успешная регистрация']);
    res.status(201).send({error: false, message: `Регистрация прошла успешно`})
  } catch (err) {
    console.log(err)
    await pool.query('INSERT INTO log (data, type, message) VALUES (NOW(), $1, $2)', ['error', 'Ошибка регистрации: ' + err.message]);
    res.status(400).send({error: true, message: `Не удалось зарегистрироваться`})
  }
});

/**
 * @swagger
 * /signout:
 *  post:
 *     description: Используется для выхода из системы
 *     responses:
 *       201:
 *         description: Успешный выход из системы
 *         content:
 *           application/json:
 *             example: {error: false, message: 'Вы успешно вышли'}
 *       400:
 *         description: Не удалось выйти из системы
 *         content:
 *           application/json:
 *             example: {error: true, message: 'Не удалось выйти из системы'}
 */

router.post('/signout', async (req, res) => {
  try {
    res.clearCookie('access_token')
    await pool.query('INSERT INTO log (data, type, message) VALUES (NOW(), $1, $2)', ['auth', 'Успешный выход из системы']);
    res.send({error: false, message: `Вы успешно вышли`})
  } catch (err) {
    console.log(err)
    await pool.query('INSERT INTO log (data, type, message) VALUES (NOW(), $1, $2)', ['error', 'Ошибка выхода из системы: ' + err.message]);
    res.status(400).send({error: true, message: `Не удалось выйти из системы`})
  }
})

/**
 * @swagger
 * /cars:
 *  get:
 *     description: Используется для получения списка автомобилей
 *     responses:
 *       200:
 *         description: Получен список автомобилей
 *         content:
 *           application/json:
 *             example: 
 *                 {
 *                 "id": 4,
 *                 "id_user": 2,
 *                 "id_antivirus": 4,
 *                 "id_onboard_control_system": 4,
 *                 "id_measuring_device_system": 4,
 *                 "id_route_computer": 4,
 *                 "model": "Honda Civic",
 *                 "plate": "L345JK",
 *                 "color": "Серый"
 *                  }
 *       400:
 *         description: Не удалось получить информацию об автомобилях
 *         content:
 *           application/json:
 *         example: {error: true, message: 'Не удалось получить информацию об автомобилях'}
 */

router.get('/cars', async (req, res) => {
  try {
    const id = req.query.userId
    const cars = await db.getCars(id)
    await pool.query('INSERT INTO log (id_source, data, type, message) VALUES ($3, NOW(), $1, $2)', ['get_cars', 'Получен список автомобилей', id]);
    res.status(200).send(cars)
  } catch (err) {
    console.log(err)
    await pool.query('INSERT INTO log (id_source, data, type, message) VALUES ($3, NOW(), $1, $2)', ['error_get_cars', 'Ошибка получения автомобилей: ' + err.message, id]);
    res.status(400).send({error: true, message: `Не удалось получить информацию об автомобилях`})
  }
})

/**
 * @swagger
 * /cars:
 *  post:
 *     description: Используется для добавления автомобиля
 *     responses:
 *       201:
 *         description: Автомобиль успешно добавлен
 *         content:
 *           application/json:
 *             example: 
 *                 {
 *                 "id": 10,
 *                 "id_user": 2,
 *                 "id_antivirus": 9,
 *                 "id_onboard_control_system": 9,
 *                 "id_measuring_device_system": 9,
 *                 "id_route_computer": 9,
 *                 "model": "Honda Civic",
 *                 "plate": "L345JK",
 *                 "color": "Серый"
 *                 }
 *       400:
 *         description: Не удалось добавить автомобиль
 *         content:
 *           application/json:
 *             example: {error: true, message: 'Не удалось добавить автомобиль'}
 */

router.post('/cars', async (req, res) => {
  try {
    const { model, plate, color, RCmodel, MDSmodel, OCSmodel, userId, AVversion } = req.body
    console.log(req.body)
    const car = await db.addCar(model, plate, color, RCmodel, MDSmodel, OCSmodel, userId, AVversion)
    await pool.query('INSERT INTO log (id_source, data, type, message) VALUES ($3, NOW(), $1, $2)', ['add_car', 'Автомобиль успешно добавлен', userId]);
    res.status(201).send(car)
  } catch (err) {
    console.log(err)
    await pool.query('INSERT INTO log (id_source, data, type, message) VALUES ($3, NOW(), $1, $2)', ['error_add_car', 'Ошибка добавления автомобиля: ' + err.message, userId]);
    res.status(400).send({error: true, message: `Не удалось добавить автомобиль`})
  }
})

/**
 * @swagger
 * /cars:
 *  delete:
 *     description: Используется для удаления автомобиля
 *     responses:
 *       200:
 *         description: Автомобиль успешно удален
 *         content:
 *           application/json:
 *             example: {error: false, message:  'Автомобиль успешно удален'}
 *       400:
 *         description: Не удалось удалить автомобиль
 *         content:
 *           application/json:
 *             example: {error: true, message: 'Не удалось удалить автомобиль'}
 */

router.delete('/cars', [authJwt.verifyToken], async (req, res) => {
  try {
    const id = req.query.carId
    const car = await db.deleteCar(id)
    await pool.query('INSERT INTO log (data, type, message) VALUES (NOW(), $1, $2)', ['delete_car', 'Автомобиль успешно удален']);
    res.status(200).send({error: false, message:  `Автомобиль успешно удален`})
  } catch (err) {
    console.log(err)
    await pool.query('INSERT INTO log (data, type, message) VALUES (NOW(), $1, $2)', ['error_delete_car', 'Ошибка удаления автомобиля: ' + err.message]);
    res.status(400).send({error: true, message: `Не удалось удалить автомобиль`})
  }
})

/**
 * @swagger
 * /cars/:id:
 *  get:
 *     description: Используется для получения данных об автомобиле
 *     responses:
 *       200:
 *         description: Получены данные автомобиля
 *         content:
 *           application/json:
 *             example:
 *                 {
 *                 "id": 3,
 *                 "model": "BMW 320i",
 *                 "plate": "M789OP",
 *                 "color": "Черный"
 *                 }
 *       400:
 *         description: Не удалось получить информацию об автомобиле
 *         content:
 *           application/json:
 *             example: {error: true, message: 'Не удалось получить информацию об автомобиле'}
 */

router.get('/cars/:id', async (req, res) => {
  try {
    const id = req.params.id
    const car = await db.getCar(id)
    if (car === null) {
      await pool.query('INSERT INTO log (data, type, message) VALUES (NOW(), $1, $2)', ['error_get_car', 'Автомобиль не найден'])
      throw 'Не удалось получить информацию об автомобиле'
    }
    await pool.query('INSERT INTO log (data, type, message) VALUES (NOW(), $1, $2)', ['get_car', 'Получены данные автомобиля'])
    res.status(200).send({
      id: car.id,
      model: car.model,
      plate: car.plate,
      color: car.color
    })
  } catch (err) {
    console.log(err)
    await pool.query('INSERT INTO log (data, type, message) VALUES (NOW(), $1, $2)', ['error', 'Ошибка получения автомобиля: ' + err.message])
    res.status(400).send({error: true, message: `Не удалось получить информацию об автомобиле`})
  }
})

/**
 * @swagger
 * /route_computer/:id:
 *  get:
 *     description: Используется для получения данных маршрутного компьютера
 *     responses:
 *       200:
 *         description: Получены данные маршрутного компьютера
 *         content:
 *           application/json:
 *             example:
 *                 {
 *                 "id": 3,
 *                 "model": "Bosh RC-300",
 *                 "fuel_consumption": 13,
 *                 "mileage": 200000
 *                 }
 *       400:
 *         description: Не удалось получить информацию о маршрутном компьютере
 *         content:
 *           application/json:
 *             example: {error: true, message: 'Не удалось получить информацию о маршрутном компьютере'}
 */

router.get('/route_computer/:id', async (req, res) => {
  try {
    const id = req.params.id
    const userId = await db.getUserIdByCarId(id)
    const rc = await db.getRC(id)
    if (rc === null) {
      await pool.query('INSERT INTO log (id_source, data, type, message) VALUES ($3, NOW(), $1, $2)', ['error_get_RC', 'Маршрутный компьютер не найден', userId])
      throw 'Не удалось получить информацию о маршрутном компьютере'
    }
    await pool.query('INSERT INTO log (id_source, data, type, message) VALUES ($3, NOW(), $1, $2)', ['get_RC', 'Получены данные маршрутного компьютера', userId])
    res.status(200).send({
      id: rc.id,
      model: rc.model,
      fuel_consumption: rc.fuel_consumption,
      mileage : rc.mileage 
    })
  } catch (err) {
    console.log(err)
    await pool.query('INSERT INTO log (id_source, data, type, message) VALUES ($3, NOW(), $1, $2)', ['error_get_RC', 'Ошибка получения маршрутного компьютера: ' + err.message, userId])
    res.status(400).send({error: true, message: `Не удалось получить информацию о маршрутном компьютере`})
  }
})

/**
 * @swagger
 * /route_computer/:id:
 *  put:
 *     description: Используется для изменения данных маршрутного компьютера
 *     responses:
 *       200:
 *         description: Данные успешно обновлены
 *         content:
 *           application/json:
 *             example: {error: false, message: 'Данные успешно обновлены'}
 *       400:
 *         description: Не удалось обновить данные
 *         content:
 *           application/json:
 *             example: {error: true, message: 'Не удалось обновить данные'}
 */

router.put('/route_computer/:id',  [authJwt.verifyToken], async (req, res) => {
  try {
    const id = req.params.id
    const userId = await db.getUserIdByCarId(id)
    const { model, fuel_consumption, mileage } = req.body
    const rc = await db.updateRC(id, model, fuel_consumption, mileage)
    await pool.query('INSERT INTO log (id_source, data, type, message) VALUES ($3, NOW(), $1, $2)', ['update_RC', 'Данные маршрутного компьютера успешно обновлены', userId])
    res.status(200).send({error: false, message: `Данные успешно обновлены`})
  } catch (err) {
    console.log(err)
    await pool.query('INSERT INTO log (id_source, data, type, message) VALUES ($3, NOW(), $1, $2)', ['error_update_RC', 'Ошибка обновления данных: ' + err.message, userId])
    res.status(400).send({error: true, message: `Не удалось обновить данные`})
  }
})

/**
 * @swagger
 * /onboard_control/:id:
 *  get:
 *     description: Используется для получения данных бортовой системы контроля
 *     responses:
 *       200:
 *         description: Получены данные бортовой системы контроля
 *         content:
 *           application/json:
 *             example:
 *                 {
 *                 "id": 3,
 *                 "model": "Bosh BCS-300",
 *                 "brake_linings_status": "normal",
 *                 "engine_oil_level": "normal",
 *                 "brake_fluid_level": "full",
 *                 "transmission_fluid_level": "low",
 *                 "coolant_level": "full",
 *                 "filter_status": "clean",
 *                 "instrument_lamps_status": "ok"
 *                 }
 *       400:
 *         description: Не удалось получить информацию о бортовой системе контроля
 *         content:
 *           application/json:
 *             example: {error: true, message: 'Не удалось получить информацию о бортовой системе контроля'}
 */

router.get('/onboard_control/:id', async (req, res) => {
  try {
    const id = req.params.id
    const userId = await db.getUserIdByCarId(id)
    const ocs = await db.getOCS(id)
    if (ocs === null) {
      await pool.query('INSERT INTO log (id_source, data, type, message) VALUES ($3, NOW(), $1, $2)', ['error_get_OCS', 'Не удалось получить информацию о бортовой системе контроля', userId])
      throw 'Не удалось получить информацию о бортовой системе контроля'
    }
    await pool.query('INSERT INTO log (id_source, data, type, message) VALUES ($3, NOW(), $1, $2)', ['get_OCS', 'Получены данные бортовой системы контроля', userId])
    res.status(200).send({
      id: ocs.id,
      model: ocs.model,
      brake_linings_status: ocs.brake_linings_status,
      engine_oil_level: ocs.engine_oil_level,
      brake_fluid_level: ocs.brake_fluid_level,
      transmission_fluid_level: ocs.transmission_fluid_level,
      coolant_level: ocs.coolant_level,
      filter_status: ocs.filter_status,
      instrument_lamps_status: ocs.instrument_lamps_status
    })
  } catch (err) {
    console.log(err)
    await pool.query('INSERT INTO log (id_source, data, type, message) VALUES ($3, NOW(), $1, $2)', ['error_get_OCS', 'Ошибка получения OCS: ' + err.message, userId])
    res.status(400).send({error: true, message: `Не удалось получить информацию о бортовой системе контроля`})
  }
})

/**
 * @swagger
 * /onboard_control/:id:
 *  put:
 *     description: Используется для получения данных бортовой системы контроля
 *     responses:
 *       200:
 *         description: Данные успешно обновлены
 *         content:
 *           application/json:
 *             example: {error: false, message: 'Данные успешно обновлены'}
 *       400:
 *         description: Не удалось обновить данные
 *         content:
 *           application/json:
 *             example: {error: true, message: 'Не удалось обновить данные'}
 */


router.put('/onboard_control/:id', [authJwt.verifyToken], async (req, res) => {
  try {
    const id = req.params.id
    const userId = await db.getUserIdByCarId(id)
    const { model, brake_linings_status, engine_oil_level, brake_fluid_level, transmission_fluid_level, coolant_level, filter_status, instrument_lamps_status } = req.body
    const osc = await db.updateOSC(id, model, brake_linings_status, engine_oil_level, brake_fluid_level, transmission_fluid_level, coolant_level, filter_status, instrument_lamps_status)
    await pool.query('INSERT INTO log (id_source, data, type, message) VALUES ($3, NOW(), $1, $2)', ['update_OCS', 'Данные успешно обновлены', userId])
    res.status(200).send({error: false, message: `Данные успешно обновлены`})
  } catch (err) {
    console.log(err)
    await pool.query('INSERT INTO log (id_source, data, type, message) VALUES ($3, NOW(), $1, $2)', ['error_update_OCS', 'Не удалось обновить данные' + err.message, userId])
    res.status(400).send({error: true, message: `Не удалось обновить данные`})
  }
})

/**
 * @swagger
 * /measuring_device/:id:
 *  get:
 *     description: Используется для получения данных системы измерительных приборов
 *     responses:
 *       200:
 *         description: Получены данные системы измерительных приборов
 *         content:
 *           application/json:
 *             example: 
 *                 {
 *                 "id": 3,
 *                 "model": "Bosh MDS-300",
 *                 "fuel_quantity": 45,
 *                 "coolant_temperature": 88,
 *                 "oil_pressure": 4
 *                 }
 *       400:
 *         description: Не удалось получить информацию о системе измерительных приборов
 *         content:
 *           application/json:
 *             example: {error: true, message: 'Не удалось получить информацию о системе измерительных приборов'}
 */

router.get('/measuring_device/:id', async (req, res) => {
  try {
    const id = req.params.id
    const userId = await db.getUserIdByCarId(id)
    const mds = await db.getMDS(id)
    if (mds === null) {
      await pool.query('INSERT INTO log (id_source, data, type, message) VALUES ($3, NOW(), $1, $2)', ['error_get_MDS', 'Система измерительных приборов не найдена', userId])
      throw 'Не удалось получить информацию о системе измерительных приборов'
    }
    await pool.query('INSERT INTO log (id_source, data, type, message) VALUES ($3, NOW(), $1, $2)', ['get_MDS', 'Получены данные системы измерительных приборов', userId])
    res.status(200).send({
      id: mds.id,
      model: mds.model,
      fuel_quantity: mds.fuel_quantity,
      coolant_temperature: mds.coolant_temperature,
      oil_pressure: mds.oil_pressure
    })
  } catch (err) {
    console.log(err)
    await pool.query('INSERT INTO log (id_source, data, type, message) VALUES ($3, NOW(), $1, $2)', ['error_get_MDS', 'Ошибка получения MDS: ' + err.message, userId])
    res.status(400).send({error: true, message: `Не удалось получить информацию о системе измерительных приборов`})
  }
})

/**
 * @swagger
 * /measuring_device/:id:
 *  put:
 *     description: Используется для обновления данных системы измерительных приборов
 *     responses:
 *       200:
 *         description: Данные успешно обновлены
 *         content:
 *           application/json:
 *             example: {error: false, message: 'Данные успешно обновлены'}
 *       400:
 *         description: Не удалось обновить данные
 *         content:
 *           application/json:
 *             example: {error: true, message: 'Не удалось обновить данные'}
 */

router.put('/measuring_device/:id', [authJwt.verifyToken], async (req, res) => {
  try {
    const id = req.params.id
    const userId = await db.getUserIdByCarId(id)
    const { model, fuel_quantity, coolant_temperature, oil_pressure } = req.body
    const mds = await db.updateMDS(id, model, fuel_quantity, coolant_temperature, oil_pressure)
    await pool.query('INSERT INTO log (id_source, data, type, message) VALUES ($3, NOW(), $1, $2)', ['update_MDS', 'Данные MDS успешно обновлены', userId])
    res.status(200).send({error: false, message: `Данные успешно обновлены`})
  } catch (err) {
    console.log(err)
    await pool.query('INSERT INTO log (id_source, data, type, message) VALUES ($3, NOW(), $1, $2)', ['error_update_MDS', 'Ошибка обновления MDS: ' + err.message, userId])
    res.status(400).send({error: true, message: `Не удалось обновить данные`})
  }
})

/**
 * @swagger
 * /antivirus/:id:
 *  get:
 *     description: Используется для получения данных антивируса
 *     responses:
 *       200:
 *         description: Получены данные антивируса
 *         content:
 *           application/json:
 *             example: 
 *                 {
 *                 "id": 3,
 *                 "version": "1.0.2",
 *                 "update_data": "2025-05-21T18:45:00.000Z",
 *                 "status": "active",
 *                 "last_scan_data": "2025-05-21T18:35:00.000Z",
 *                 "last_scan_result": "warning"
 *                 }
 *       400:
 *         description: Не удалось получить информацию об антивирусе
 *         content:
 *           application/json:
 *             example: {error: true, message: 'Не удалось получить информацию об антивирусе'}
 */

router.get('/antivirus/:id', async (req, res) => {
  try {
    const id = req.params.id
    const antivirus = await db.getAntivirus(id)
    if (antivirus === null) {
      await pool.query('INSERT INTO log (data, type, message) VALUES (NOW(), $1, $2)', ['error', 'Антивирус не найден'])
      throw 'Не удалось получить информацию об антивирусе'
    }
    await pool.query('INSERT INTO log (data, type, message) VALUES (NOW(), $1, $2)', ['info', 'Получены данные антивируса'])
    res.status(200).send({
      id: antivirus.id,
      version: antivirus.version,
      update_data: antivirus.update_data,
      status: antivirus.status,
      last_scan_data: antivirus.last_scan_data,
      last_scan_result: antivirus.last_scan_result
    })
  } catch (err) {
    console.log(err)
    await pool.query('INSERT INTO log (data, type, message) VALUES (NOW(), $1, $2)', ['error', 'Ошибка получения антивируса: ' + err.message])
    res.status(400).send({error: true, message: `Не удалось получить информацию об антивирусе`})
  }
})

/**
 * @swagger
 * /antivirus/:id:
 *  put:
 *     description: Используется для обновления данных антивируса
 *     responses:
 *       200:
 *         description: Данные успешно обновлены
 *         content:
 *           application/json:
 *             example: {error: false, message: 'Данные успешно обновлены'}
 *       400:
 *         description: Не удалось обновить данные
 *         content:
 *           application/json:
 *             example: {error: true, message: 'Не удалось обновить данные'}
 */

router.put('/antivirus/:id', async (req, res) => {
  try {
    const id = req.params.id
    const { version, update_data, status, last_scan_data, last_scan_result } = req.body
    const mds = await db.updateAntivirus(id, version, update_data, status, last_scan_data, last_scan_result)
    await pool.query('INSERT INTO log (data, type, message) VALUES (NOW(), $1, $2)', ['update', 'Данные антивируса успешно обновлены'])
    res.status(200).send({error: false, message: `Данные успешно обновлены`})
  } catch (err) {
    console.log(err)
    await pool.query('INSERT INTO log (data, type, message) VALUES (NOW(), $1, $2)', ['error', 'Ошибка обновления антивируса: ' + err.message])
    res.status(400).send({error: true, message: `Не удалось обновить данные`})
  }
})

/**
 * @swagger
 * /checkSystem:
 *  get:
 *     description: Используется для получения результатов проверки системы
 *     responses:
 *       200:
 *         description: Получены данные проверки системы
 *         content:
 *           application/json:
 *             example: 
 *                 {
 *                 "автомобиль": "Honda Civic",
 *                 "устройство": "Continental MDS-400",
 *                 "проблемы": [
 *                 "Низкий уровень топлива",
 *                 "Высокая температура"
 *                 ]
 *                 }
 *       400:
 *         description: Не удалось получить информацию о системе
 *         content:
 *           application/json:
 *             example: {error: true, message: 'Не удалось получить информацию о системе'}
 */

router.get('/checkSystem', async (req, res) => {
  try {
    const id = req.params.id
    const infoRC = await db.getSystemInfoRC(id)
    const infoOCS = await db.getSystemInfoOCS(id)
    const infoMDS = await db.getSystemInfoMDS()
    const allDevicesInfo = infoMDS.concat(infoOCS.concat(infoRC))
    await pool.query('INSERT INTO log (data, type, message) VALUES (NOW(), $1, $2)', ['chek_system', 'Получены данные проверки системы'])
    res.status(200).send(allDevicesInfo)
  } catch (err) {
    console.log(err)
    await pool.query('INSERT INTO log (data, type, message) VALUES (NOW(), $1, $2)', ['error', 'Ошибка проверки системы'])
    res.status(400).send({error: true, message: `Не удалось получить информацию о системе`})
  }
})

/**
 * @swagger
 * /log:
 *  get:
 *     description: Используется для получения результатов проверки логов
 *     responses:
 *       200:
 *         description: Получены данные проверки логов
 *         content:
 *           application/json:
 *             example: 
 *                 {
 *                 "anomalies":
 *                 [{
 *                 "Тип": "Доступ к данным маршрутного компьютера автомобиля ",
 *                 "Детали": "Обнаружено 6 попыток доступа за короткий промежуток времени"
 *                 }
 *                 ]}
 */

router.get('/log', async (req, res) => {
  const userId = req.query.userId
  const logs = await db.getLogByUserId(userId)
  const anomalies = [];
  const attempsGetRC = logs?.filter(log => log.type === 'get_RC');
        if (attempsGetRC.length > 5) {
            anomalies.push({
                Тип: 'Доступ к данным маршрутного компьютера автомобиля ',
                Детали: `Обнаружено ${attempsGetRC.length} попыток доступа за короткий промежуток времени`
            });
        }
  const attempsErrorGetRC = logs?.filter(log => log.type === 'error_get_RC');
        if (attempsErrorGetRC.length > 5) {
            anomalies.push({
                Тип: 'Доступ к данным маршрутного компьютера автомобиля ',
                Детали: `Обнаружено ${attempsErrorGetRC.length} неудачных попыток доступа за короткий промежуток времени`
            });
        }
  const attempsUpdateRC = logs?.filter(log => log.type === 'update_RC');
        if (attempsUpdateRC.length > 5) {
            anomalies.push({
                Тип: 'Редактирование данных маршрутного компьютера автомобиля ',
                Детали: `Обнаружено ${attempsUpdateRC.length} попыток редактирования данных за короткий промежуток времени`
            });
        }
  const attempsErrorUpdateRC = logs?.filter(log => log.type === 'error_update_RC');
        if (attempsErrorUpdateRC.length > 5) {
            anomalies.push({
                Тип: 'Редактирование данных маршрутного компьютера автомобиля ',
                Детали: `Обнаружено ${attempsErrorUpdateRC.length} неудачных попыток редактирования данных за короткий промежуток времени`
            });
        }
  const attempsGetOCS = logs?.filter(log => log.type === 'get_OCS');
        if (attempsGetOCS.length > 5) {
            anomalies.push({
                Тип: 'Доступ к данным бортовой системы контроля',
                Детали: `Обнаружено ${attempsGetOCS.length} попыток доступа за короткий промежуток времени`
            });
        }
  const attempsErrorGetOCS = logs?.filter(log => log.type === 'error_get_OCS');
        if (attempsErrorGetOCS.length > 5) {
            anomalies.push({
                Тип: 'Доступ к данным бортовой системы контроля',
                Детали: `Обнаружено ${attempsErrorGetOCS.length} неудачных попыток доступа за короткий промежуток времени`
            });
        }
  const attempsUpdateOCS = logs?.filter(log => log.type === 'update_OCS');
        if (attempsUpdateOCS.length > 5) {
            anomalies.push({
                Тип: 'Редактирование данных бортовой системы контроля',
                Детали: `Обнаружено ${attempsUpdateOCS.length} попыток редактирования данных за короткий промежуток времени`
            });
        }
  const attempsErrorUpdateOCS = logs?.filter(log => log.type === 'error_update_OCS');
        if (attempsErrorUpdateOCS.length > 5) {
            anomalies.push({
                Тип: 'Редактирование данных бортовой системы контроля',
                Детали: `Обнаружено ${attempsErrorUpdateOCS.length} неудачных попыток редактирования данных за короткий промежуток времени`
            });
        }
  const attempsGetMDS = logs?.filter(log => log.type === 'get_MDS');
        if (attempsGetMDS.length > 5) {
            anomalies.push({
                Тип: 'Доступ к данным системы измерительных приборов',
                Детали: `Обнаружено ${attempsGetMDS.length} попыток доступа за короткий промежуток времени`
            });
        }
  const attempsErrorGetMDS = logs?.filter(log => log.type === 'error_get_MDS');
        if (attempsErrorGetMDS.length > 5) {
            anomalies.push({
                Тип: 'Доступ к данным системы измерительных приборов',
                Детали: `Обнаружено ${attempsErrorGetMDS.length} неудачных попыток доступа за короткий промежуток времени`
            });
        }
  const attempsUpdateMDS = logs?.filter(log => log.type === 'update_MDS');
        if (attempsUpdateMDS.length > 5) {
            anomalies.push({
                Тип: 'Редактирование данных системы измерительных приборов',
                Детали: `Обнаружено ${attempsUpdateMDS.length} попыток редактирования данных за короткий промежуток времени`
            });
        }
  const attempsErrorUpdateMDS = logs?.filter(log => log.type === 'error_update_MDS');
        if (attempsErrorUpdateMDS.length > 5) {
            anomalies.push({
                Тип: 'Редактирование данных системы измерительных приборов',
                Детали: `Обнаружено ${attempsErrorUpdateMDS.length} неудачных попыток редактирования данных за короткий промежуток времени`
            });
        }
  const attempsGetCars = logs?.filter(log => log.type === 'get_cars');
        if (attempsGetCars.length > 5) {
          anomalies.push({
              Тип: 'Доступ к данным об автомобилях',
              Детали: `Обнаружено ${attempsGetCars.length} попыток доступа за короткий промежуток времени`
          });
      }
  const attempsErrorGetCars = logs?.filter(log => log.type === 'error_get_cars');
      if (attempsErrorGetCars.length > 5) {
        anomalies.push({
            Тип: 'Доступ к данным об автомобилях',
            Детали: `Обнаружено ${attempsErrorGetCars.length} попыток доступа за короткий промежуток времени`
        });
    }
  const attempsAddCar = logs?.filter(log => log.type === 'add_car');
      if (attempsAddCar.length > 2) {
        anomalies.push({
            Тип: 'Добавление автомобиля',
            Детали: `Обнаружено ${attempsAddCar.length} добавленных автомобилей за короткий промежуток времени`
        });
    }
  const attempsErrorAddCar = logs?.filter(log => log.type === 'error_add_car');
    if (attempsErrorAddCar.length > 2) {
      anomalies.push({
          Тип: 'Добавление автомобиля',
          Детали: `Обнаружено ${attempsErrorAddCar.length} попытой добавить автомобиль за короткий промежуток времени`
      });
  }
  const attempsDeleteCars = logs?.filter(log => log.type === 'delete_cars');
  if (attempsDeleteCars.length > 5) {
    anomalies.push({
        Тип: 'Удаление данных автомобилей',
        Детали: `Обнаружено ${attempsDeleteCars.length} попыток удаления данных за короткий промежуток времени`
    });
  }
  const attempsErrorDeleteCars = logs?.filter(log => log.type === 'error_delete_cars');
  if (attempsErrorDeleteCars.length > 5) {
    anomalies.push({
        Тип: 'Удаление данных автомобилей',
        Детали: `Обнаружено ${attempsErrorDeleteCars.length} неудачных попыток удаления данных за короткий промежуток времени`
    });
  }
  res.status(200).json({ anomalies })

})

module.exports = router;