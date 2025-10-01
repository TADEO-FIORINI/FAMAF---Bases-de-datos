-- 1. Obtener los usuarios que han gastado más en reservas
SELECT u.id, u.name, SUM(p.amount) AS total_spent
FROM users AS u
JOIN payments AS p ON p.user_id = u.id
GROUP BY p.user_id
ORDER BY total_spent DESC;

-- 2. Obtener las 10 propiedades con el mayor ingreso total por reservas
SELECT pr.*, SUM(p.amount) AS earnings
FROM properties AS pr
JOIN bookings AS b ON b.property_id = pr.id
JOIN payments AS p ON p.booking_id = b.id
WHERE p.status = "completed"
GROUP BY pr.id
ORDER BY SUM(p.amount) DESC
LIMIT 10;


SELECT pr.*, SUM(b.total_price)
FROM properties AS pr
JOIN bookings AS b ON b.property_id = pr.id
WHERE b.status = "paid"
GROUP BY pr.id
ORDER BY SUM(b.total_price) DESC
LIMIT 10;

-- 3. Crear un trigger para registrar automáticamente reseñas negativas en la tabla de
-- mensajes. Es decir, el owner recibe un mensaje al obtener un review menor o igual a 2.
DELIMITER $$
CREATE FUNCTION get_property_owner(_property_id INT)
RETURNS INT
DETERMINISTIC
BEGIN
DECLARE _owner_id INT;
SET _owner_id = (
    SELECT owner_id
    FROM properties
    WHERE id = _property_id
);
RETURN _owner_id;
END $$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER register_bad_reviews AFTER INSERT
ON reviews FOR EACH ROW
BEGIN 
    INSERT INTO messages (sender_id, receiver_id, property_id, content)
    SELECT NEW.user_id, get_property_owner(NEW.property_id), NEW.property_id, NEW.comment
    WHERE NEW.rating <= 2;
END $$
DELIMITER ;


-- INSERT INTO reviews (booking_id, user_id, property_id, rating, comment)
-- VALUES (1302, 1747, 1619, 2, 'bad booking');

-- SELECT * FROM messages
-- ORDER BY id DESC
-- LIMIT 1;


-- 4. Crear un procedimiento Crear un procedimiento llamado process_payment que:
-- Reciba los siguientes parámetros:
-- - input_booking_id (INT): El ID de la reserva.
-- - input_user_id (INT): El ID del usuario que realiza el pago.
-- - input_amount (NUMERIC): El monto del pago.
-- - input_payment_method (VARCHAR): El método de pago utilizado (por ejemplo,
-- "credit_card", "paypal").
-- Requisitos: verificar si la reserva asociada existe y está en estado confirmed. Insertar
-- un nuevo registro en la tabla payments. Actualizar el estado de la reserva a paid.
-- No es necesario manejar errores ni transacciones en este procedimiento

DELIMITER $$
CREATE PROCEDURE process_payment(
    IN input_booking_id INT,
    IN input_user_id INT,
    IN input_amount NUMERIC(10,2),
    IN input_payment_method VARCHAR(20)
)
BEGIN
    DECLARE confirmed VARCHAR(1) DEFAULT 'F';
    IF EXISTS (
        SELECT * FROM bookings
        WHERE id=input_booking_id
        AND user_id=input_user_id
        AND status='confirmed'
    ) THEN 
        SET confirmed = 'T';
    END IF;

    IF confirmed = 'T' THEN
        INSERT INTO payments (booking_id, user_id, amount, payment_method)
        VALUES (input_booking_id, input_user_id, input_amount, input_payment_method);

        UPDATE bookings
        SET status = 'paid'
        WHERE id=input_booking_id;
    END IF;
END $$
DELIMITER ;


-- SELECT * FROM bookings WHERE status='confirmed' ORDER BY id DESC LIMIT 1;
-- CALL process_payment(1398, 1783, 1504.00, "credit_card");
-- SELECT * FROM payments ORDER BY id DESC LIMIT 1;