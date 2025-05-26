const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres', 
    host: 'localhost', 
    database: 'postgres', 
    password: '080906', 
    port: 5432, 
  });  

exports.getUser = async username => {
  const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return rows[0]
};

exports.createUser = async (username, email, password)  => {
  const { rows } = await pool.query('INSERT INTO users (username, id_access_right, email, hash_password) VALUES ($1, 2, $2, $3) RETURNING *', [username, email, password])
  return rows?.length >= 1 ? rows[0] : null
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    const result = await pool.query('UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *', [name, email, id]);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = $1;', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.getCars = async id_user => {
  const {rows} = await pool.query('SELECT * FROM car WHERE id_user = $1', [id_user])
  return rows
}

exports.getCar = async id => {
  const { rows } = await pool.query('SELECT * FROM car WHERE id = $1', [id])
  return rows[0]
}

exports.addCar = async (model, plate, color, RCmodel, MDSmodel, OCSmodel, userId, AVversion) => {
  const { rows } = await pool.query('WITH mds_insert AS ( INSERT INTO measuring_device_system (model, fuel_quantity, coolant_temperature, oil_pressure) VALUES ($1, 50, 85, 3.5) RETURNING id), ocs_insert AS (INSERT INTO onboard_control_system (model, brake_linings_status, engine_oil_level, brake_fluid_level, transmission_fluid_level, coolant_level, filter_status, instrument_lamps_status) VALUES ($2, \'good\', \'normal\', \'normal\', \'normal\', \'normal\', \'clear\', \'ok\') RETURNING id), rc_insert AS (INSERT INTO route_computer (model, fuel_consumption, mileage) VALUES ($3, 8, 15000) RETURNING id), av_insert AS (INSERT INTO antivirus (version, update_data, status, last_scan_data, last_scan_result) VALUES ($8, NOW(), \'active\', NOW(), \'clean\') RETURNING id), new_car AS (INSERT INTO car (id_user, id_antivirus, id_onboard_control_system, id_measuring_device_system, id_route_computer, model, plate, color) SELECT $4, (SELECT id FROM av_insert), (SELECT id FROM ocs_insert), (SELECT id FROM mds_insert), (SELECT id FROM rc_insert), $5, $6, $7 RETURNING *) SELECT * FROM new_car WHERE id_user = $4 AND plate = $6', [MDSmodel, OCSmodel, RCmodel, userId, model, plate, color, AVversion])
  return rows[0]
}

exports.deleteCar = async carId => {
  const { rows } = await pool.query('DELETE FROM car WHERE id = $1;', [carId])
  return rows[0]
}

exports.getRC = async id => {
  const { rows } = await pool.query('SELECT rc.id, rc.model, rc.fuel_consumption, rc.mileage FROM car c JOIN route_computer rc ON c.id_route_computer = rc.id WHERE c.id = $1;', [id])
  return rows[0]
}

exports.updateRC = async (id, model, fuel_consumption, mileage) => {
  const { rows } = await  pool.query('UPDATE route_computer rc SET model = $1, fuel_consumption = $2, mileage = $3 FROM car c WHERE c.id = $4 AND c.id_route_computer = rc.id;', [model, fuel_consumption, mileage, id])
  return rows[0]
}

exports.getOCS = async id => {
  const { rows } = await pool.query('SELECT ocs.id, ocs.model, ocs.brake_linings_status, ocs.engine_oil_level, ocs.brake_fluid_level, ocs.transmission_fluid_level, ocs.coolant_level, ocs.filter_status, ocs.instrument_lamps_status FROM car c JOIN onboard_control_system ocs ON c.id_onboard_control_system = ocs.id WHERE c.id = $1;', [id])
  return rows[0]
}

exports.updateOSC = async (id, model, brake_linings_status, engine_oil_level, brake_fluid_level, transmission_fluid_level, coolant_level, filter_status, instrument_lamps_status) => {
  const { rows } = await pool.query('UPDATE onboard_control_system osc SET model = $1, brake_linings_status = $2, engine_oil_level = $3, brake_fluid_level = $4, transmission_fluid_level = $5, coolant_level = $6, filter_status = $7, instrument_lamps_status = $8 FROM car c WHERE c.id = $9 AND c.id_onboard_control_system = osc.id;', [model, brake_linings_status, engine_oil_level, brake_fluid_level, transmission_fluid_level, coolant_level, filter_status, instrument_lamps_status, id])
  return rows[0]
}

exports.getMDS = async id => {
  const { rows } = await pool.query('SELECT mds.id, mds.model, mds.fuel_quantity, mds.coolant_temperature, mds.oil_pressure FROM car c JOIN measuring_device_system mds ON c.id_measuring_device_system = mds.id WHERE c.id = $1;', [id])
  return rows[0]
}

exports.updateMDS = async (id, model, fuel_quantity, coolant_temperature, oil_pressure) => {
  const { rows } = await pool.query('UPDATE measuring_device_system mds SET model = $1, fuel_quantity = $2, coolant_temperature = $3, oil_pressure = $4 FROM car c WHERE c.id = $5 AND c.id_measuring_device_system = mds.id;', [model, fuel_quantity, coolant_temperature, oil_pressure, id])
  return rows[0]
}

exports.getAntivirus = async id => {
  const { rows } = await pool.query('SELECT av.id, av.version, av.update_data, av.status, av.last_scan_data, av.last_scan_result FROM car c JOIN antivirus av ON c.id_antivirus = av.id WHERE c.id = $1;', [id])
  return rows[0]
}

exports.updateAntivirus = async (id, version, update_data, status, last_scan_data, last_scan_result) => {
  const { rows } = await pool.query('UPDATE antivirus av SET version = $1, update_data = $2, status = $3, last_scan_data = $4, last_scan_result = $5 FROM car c WHERE c.id = $6 AND c.id_antivirus = av.id;', [version, update_data, status, last_scan_data, last_scan_result, id])
  return rows[0]
}

exports.getSystemInfoRC = async () => {
  const result = await pool.query(`
    SELECT 
    c.model AS car_model,
    rc.model AS device_model,
    CASE 
    WHEN fuel_consumption > 9 THEN 'Высокий расход топлива'
    END AS fuel_status,
    CASE 
    WHEN mileage > 150000 THEN 'Большой пробег'
    END AS mileage_status
    FROM route_computer rc
    JOIN car c ON c.id_route_computer = rc.id
    WHERE fuel_consumption > 9
    OR mileage > 150000
  `)

 const badResults = result.rows.map(row => ({
  автомобиль: row.car_model,
  устройство: row.device_model,
  проблемы: [
    row.fuel_status,
    row.mileage_status ]
    .filter(status => status)
  }))

  if (badResults == null) return {
    автомобиль: все_автомобили,
    устройство: все_устройства,
    проблемы: отсутствуют
  }
  return (badResults)
}

exports.getSystemInfoOCS = async () => {
  const result = await pool.query(`
    SELECT 
    c.model AS car_model,
    ocs.model AS device_model,
    CASE 
    WHEN brake_linings_status != 'good' THEN 'Изношенные тормозные колодки'
    END AS brake_status,
    CASE 
    WHEN engine_oil_level = 'low' THEN 'Низкий уровень масла'
    END AS oil_status,
    CASE 
    WHEN brake_fluid_level = 'low' THEN 'Низкий уровень тормозной жидкости'
    END AS brake_fluid_status,
    CASE 
    WHEN transmission_fluid_level = 'low' THEN 'Низкий уровень трансмиссионной жидкости'
    END AS trans_status,
    CASE 
    WHEN coolant_level = 'low' THEN 'Низкий уровень охлаждающей жидкости'
    END AS coolant_status,
    CASE 
    WHEN filter_status = 'dirty' THEN 'Загрязненный фильтр'
    END AS filter_status,
    CASE 
    WHEN instrument_lamps_status != 'ok' THEN 'Проблемы с приборными лампами'
    END AS lamps_status
    FROM onboard_control_system ocs
    JOIN car c ON c.id_onboard_control_system = ocs.id
    WHERE brake_linings_status != 'good'
    OR engine_oil_level = 'low'
    OR brake_fluid_level = 'low'
    OR transmission_fluid_level = 'low'
    OR coolant_level = 'low'
    OR filter_status = 'dirty'
    OR instrument_lamps_status != 'ok'
  `);

 const badResults = result.rows.map(row => ({
  автомобиль: row.car_model,
  устройство: row.device_model,
  проблемы: [
    row.brake_status,
    row.oil_status,
    row.brake_fluid_status,
    row.trans_status,
    row.coolant_status,
    row.filter_status,
    row.lamps_status ]
    .filter(status => status)
  }));
  if (badResults == null) return {
    автомобиль: все_автомобили,
    устройство: все_устройства,
    проблемы: отсутствуют
  }
  return (badResults);
}

exports.getSystemInfoMDS = async () => {
  const result = await pool.query(`
    SELECT 
    c.model AS car_model,
    mds.model AS device_model,
    CASE 
    WHEN fuel_quantity < 30 THEN 'Низкий уровень топлива'
    END AS fuel_status,
    CASE 
    WHEN coolant_temperature > 95 THEN 'Высокая температура'
    END AS temp_status,
    CASE 
    WHEN oil_pressure < 3 THEN 'Низкое давление масла'
    END AS pressure_status
    FROM measuring_device_system mds
    JOIN car c ON c.id_measuring_device_system = mds.id
    WHERE fuel_quantity < 30 
    OR coolant_temperature > 95
    OR oil_pressure < 3
 `)
 const badResults = result.rows.map(row => ({
    автомобиль: row.car_model,
    устройство: row.device_model,
    проблемы: [
      row.fuel_status,
      row.temp_status,
      row.pressure_status]
    .filter(status => status)
  }));
  if (badResults == null) return {
    автомобиль: все_автомобили,
    устройство: все_устройства,
    проблемы: отсутствуют
  }
  return badResults;
}

exports.getUserIdByCarId = async carId => {
  const { rows } = await pool.query('SELECT id_user FROM car WHERE id = $1;', [carId])
  return rows[0].id_user
}

exports.getLogByUserId = async UserId => {
  const { rows } = await pool.query('SELECT * FROM log WHERE id_source = $1 ORDER BY data DESC LIMIT 100', [UserId])
  return rows
}