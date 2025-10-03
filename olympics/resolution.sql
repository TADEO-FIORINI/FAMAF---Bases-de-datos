-- Listar todas las ciudades sede de los juegos olímpicos de verano junto con su año,
-- de más reciente a menos reciente (1p)

SELECT c.city_name, g.games_year
FROM games_city AS gc
JOIN games AS g ON gc.games_id = g.id
JOIN city AS c ON gc.city_id = c.id
WHERE g.season = 'Summer'
ORDER BY g.games_year DESC;


-- 2. Obtener el ranking de los 10 países con más medallas de oro en fútbol (1.5p)

SELECT r.region_name, COUNT(DISTINCT g.id)
FROM games_competitor as gc
JOIN games AS g ON gc.games_id = g.id
JOIN person AS p ON gc.person_id = p.id
JOIN competitor_event AS ce ON gc.id = ce.competitor_id   
JOIN medal AS m ON ce.medal_id = m.id
JOIN event AS e ON ce.event_id = e.id
JOIN sport AS s ON e.sport_id = s.id
JOIN person_region AS pr ON p.id = pr.person_id
JOIN noc_region AS r ON pr.region_id = r.id
WHERE s.sport_name = 'Football'
AND m.medal_name = 'Gold'
GROUP BY r.id
ORDER BY COUNT(DISTINCT g.id) DESC
LIMIT 10;


-- 3. Listar con la misma query el país con más participaciones y el país con menos
-- participaciones en los juegos olímpicos (2p)
(SELECT r.region_name, COUNT(DISTINCT g.id)
FROM games_competitor as gc
JOIN games AS g ON gc.games_id = g.id
JOIN person AS p ON gc.person_id = p.id
JOIN person_region AS pr ON p.id = pr.person_id
JOIN noc_region AS r ON pr.region_id = r.id
GROUP BY r.id
ORDER BY COUNT(g.id) DESC
LIMIT 1)
UNION
(SELECT r.region_name, COUNT(DISTINCT g.id)
FROM games_competitor as gc
JOIN games AS g ON gc.games_id = g.id
JOIN person AS p ON gc.person_id = p.id
JOIN person_region AS pr ON p.id = pr.person_id
JOIN noc_region AS r ON pr.region_id = r.id
GROUP BY r.id
ORDER BY COUNT(g.id) ASC
LIMIT 1);

-- 4. Crear una vista en la que se muestren entradas del tipo (país, deporte, medallas de
-- oro, medallas de plata, medallas de bronce, participaciones sin medallas) para cada
-- país y deporte (2.5p)


-- 5. Crear un procedimiento que reciba como parámetro el nombre de un país y
-- devuelva la cantidad total (sumando todos los deportes) de medallas de oro, plata y
-- bronce ganadas por ese país. Puede usar la vista creada en el punto anterior, va a
-- ser mucho más fácil. (1.5p)

SELECT r