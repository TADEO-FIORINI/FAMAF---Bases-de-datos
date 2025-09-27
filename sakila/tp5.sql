-- 1. Cree una tabla de `directors` con las columnas: Nombre, Apellido, Número de Películas.
CREATE TABLE IF NOT EXISTS directors(
    director_id SMALLINT UNSIGNED NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    number_of_movies SMALLINT UNSIGNED,
    last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (director_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. El top 5 de actrices y actores de la tabla `actors` que tienen la mayor experiencia 
-- (i.e. el mayor número de películas filmadas) son también directores de las películas en 
-- las que participaron. Basados en esta información, inserten, utilizando una subquery los 
-- valores correspondientes en la tabla `directors`.
DELIMITER $$
CREATE FUNCTION actor_film_count(_actor_id SMALLINT) 
    RETURNS SMALLINT
    DETERMINISTIC
    BEGIN
    DECLARE film_count SMALLINT;
    SET film_count = ( 
        SELECT COUNT(*)
        FROM film_actor
        WHERE actor_id = _actor_id
    );
    RETURN film_count;
    END$$
DELIMITER ;

INSERT INTO directors (director_id, first_name, last_name, number_of_movies)
SELECT actor_id, first_name, last_name, actor_film_count(actor_id) AS af_count
FROM actor
ORDER BY af_count DESC
LIMIT 5;


-- 3. Agregue una columna `premium_customer` que tendrá un valor 'T' o 'F' de acuerdo a si 
-- el cliente es "premium" o no. Por defecto ningún cliente será premium.
ALTER TABLE customer
ADD COLUMN premium_customer VARCHAR(1) DEFAULT 'F'; 


-- 4. Modifique la tabla customer. Marque con 'T' en la columna `premium_customer` de los 
-- 10 clientes con mayor dinero gastado en la plataforma.
DELIMITER $$
CREATE FUNCTION customer_money_spent(_customer_id SMALLINT)
    RETURNS SMALLINT
    DETERMINISTIC
    BEGIN
    DECLARE customer_spent SMALLINT;
    SET customer_spent = (
        SELECT SUM(amount) 
        FROM payment
        WHERE customer_id = _customer_id
    );
    RETURN customer_spent;
    END $$
DELIMITER ;
    

UPDATE customer c
JOIN (
    SELECT customer_id
    FROM customer
    ORDER BY customer_money_spent(customer_id) DESC
    LIMIT 10
) top10 ON c.customer_id = top10.customer_id
SET c.premium_customer = 'T';


-- 5. Listar, ordenados por cantidad de películas (de mayor a menor), los distintos ratings de 
-- las películas existentes (Hint: rating se refiere en este caso a la clasificación según edad: G, PG, R, etc).

SELECT rating, COUNT(*) AS rating_films
FROM film
GROUP BY rating
ORDER BY rating_films DESC;


-- MIO. Listar las categorias junto a sus cantidades de pelicualas de mayor a menor
DELIMITER $$
CREATE FUNCTION movies_per_category(_category_id SMALLINT)
RETURNS SMALLINT
DETERMINISTIC
BEGIN
DECLARE m_count SMALLINT;
SET m_count = (
    SELECT COUNT(*)
    FROM film_category
    WHERE category_id = _category_id
);
RETURN m_count;
END $$
DELIMITER ;

SELECT name, movies_per_rating(category_id)
FROM category
ORDER BY movies_per_rating(category_id) DESC;


-- 6. ¿Cuáles fueron la primera y última fecha donde hubo pagos?
SELECT MIN(payment_date), MAX(payment_date)
FROM payment;


-- 7. Calcule, por cada mes, el promedio de pagos (Hint: vea la manera de extraer el nombre del mes de una fecha).
SELECT MONTHNAME(payment_date), YEAR(payment_date), AVG(amount)
FROM payment
GROUP BY MONTHNAME(payment_date), YEAR(payment_date);


-- 8. Listar los 10 distritos que tuvieron mayor cantidad de alquileres (con la cantidad total de alquileres).
SELECT city.city AS city, COUNT(city.city_id) AS total_rentals
FROM rental
JOIN customer ON rental.customer_id = customer.customer_id
JOIN address ON customer.address_id = address.address_id
JOIN city ON address.city_id = city.city_id
GROUP BY city.city_id
ORDER BY total_rentals DESC
LIMIT 10;


-- 9. Modifique la table `inventory_id` agregando una columna `stock` que sea un número entero y representa la cantidad 
-- de copias de una misma película que tiene determinada tienda. El número por defecto debería ser 5 copias.
ALTER TABLE inventory
ADD COLUMN stock INTEGER DEFAULT 5; 


-- 10. Cree un trigger `update_stock` que, cada vez que se agregue un nuevo registro a la tabla rental, haga un update en la 
-- tabla `inventory` restando una copia al stock de la película rentada (Hint: revisar que el rental no tiene información 
-- directa sobre la tienda, sino sobre el cliente, que está asociado a una tienda en particular).
DELIMITER $$
CREATE TRIGGER update_stock BEFORE INSERT ON rental 
FOR EACH ROW
BEGIN 
    UPDATE inventory
    SET inventory.stock = inventory.stock - 1
    WHERE inventory_id = NEW.inventory_id;
END $$
DELIMITER ;

INSERT INTO rental (rental_date, inventory_id, customer_id, return_date, staff_id)
VALUES (NOW(), 1, 1, NULL, 1);

SELECT * FROM inventory WHERE inventory_id = 1; -- se resto uno, el trigger funciona

-- INSERT --> NEW
-- DELETE --> OLD
-- UPDATE --> OLD, NEW

-- 11. Cree una tabla `fines` que tenga dos campos: `rental_id` y `amount`. El primero es una clave foránea a la tabla rental y el
-- segundo es un valor numérico con dos decimales.

CREATE TABLE IF NOT EXISTS fines(
    rental_id INT NOT NULL,
    amount DECIMAL(10, 2),
    PRIMARY KEY (rental_id),
    FOREIGN KEY (rental_id) REFERENCES rental(rental_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 12. Cree un procedimiento `check_date_and_fine` que revise la tabla `rental` y cree un registro en la tabla `fines` por cada 
-- `rental` cuya devolución (return_date) haya tardado más de 3 días (comparación con rental_date). El valor de la multa será el 
-- número de días de retraso multiplicado por 1.5.

DELIMITER $$
CREATE PROCEDURE check_date_and_fine()
BEGIN
INSERT INTO fines(rental_id, amount) 
SELECT rental_id, DATEDIFF(return_date, rental_date) * 1.5
FROM rental
WHERE DATEDIFF(return_date, rental_date) > 3;
END $$
DELIMITER ;

CALL check_date_and_fine();

-- 13. Crear un rol `employee` que tenga acceso de inserción, eliminación y actualización a la tabla `rental`.
CREATE ROLE employee;
GRANT INSERT, DELETE, UPDATE ON sakila.rental TO employee;

-- 14. Revocar el acceso de eliminación a `employee` y crear un rol `administrator` que tenga todos los privilegios sobre la BD `sakila`.
REVOKE DELETE ON sakila.rental FROM employee;
CREATE ROLE administrator;
GRANT ALL PRIVILEGES ON sakila.* TO administrator;

-- 15. Crear dos roles de empleado. A uno asignarle los permisos de `employee` y al otro de `administrator`.
CREATE USER 'empleado1'@'localhost' IDENTIFIED BY 'clave1';
CREATE USER 'empleado2'@'localhost' IDENTIFIED BY 'clave2';

GRANT employee TO 'empleado1'@'localhost';
GRANT administrator TO 'empleado2'@'localhost';

SHOW GRANTS FOR "employee";