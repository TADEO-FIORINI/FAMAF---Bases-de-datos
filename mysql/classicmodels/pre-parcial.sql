--1. Devuelva la oficina con mayor número de empleados.
SELECT o.*, COUNT(*) AS cantidad_empleados
FROM offices AS o
JOIN employees AS e ON e.officeCode = o.officeCode
GROUP BY o.officeCode
ORDER BY cantidad_empleados DESC
LIMIT 1;


--2.1. ¿Cuál es el promedio de órdenes hechas por oficina?, 
SELECT 
    f.officeCode AS off_code, 
    COUNT(o.orderNumber) AS orders,
    YEAR(o.orderDate) AS yy,
    MONTH(o.orderDate) AS mm
FROM orders AS o
JOIN customers AS c ON o.customerNumber = c.customerNumber
JOIN employees AS e ON c.salesRepEmployeeNumber = e.employeeNumber
JOIN offices AS f ON e.officeCode = f.officeCode
GROUP BY f.officeCode, YEAR(o.orderDate), MONTH(o.orderDate)
ORDER BY f.officeCode, YEAR(o.orderDate), MONTH(o.orderDate);


DELIMITER $$
CREATE FUNCTION avg_monthly_orders_from_office(_officeCode VARCHAR(10))
    RETURNS NUMERIC(10,2)
    DETERMINISTIC
    BEGIN
        DECLARE avg_orders NUMERIC (10,2);
        
        SELECT AVG(monthly_count)
        INTO avg_orders
        FROM (
            SELECT COUNT(o.orderNumber) AS monthly_count
            FROM orders AS o
            JOIN customers AS c ON o.customerNumber = c.customerNumber
            JOIN employees AS e ON c.salesRepEmployeeNumber = e.employeeNumber
            AND e.officeCode = _officeCode
            GROUP BY e.officeCode, YEAR(o.orderDate), MONTH(o.orderDate)
        ) AS monthly_orders;

        RETURN avg_orders;
    END $$
DELIMITER ;


SELECT officeCode, avg_monthly_orders_from_office(officeCode)
FROM offices;


-- 2.2. ¿Qué oficina vendió la mayor cantidad de productos?
SELECT o.*, COUNT(*) AS n
FROM offices AS o
JOIN employees AS e ON e.officeCode = o.officeCode
JOIN customers AS c ON c.salesRepEmployeeNumber = e.employeeNumber
JOIN payments AS p ON p.customerNumber = c.customerNumber
GROUP BY p.customerNumber
ORDER BY n DESC
LIMIT 1;


-- 3. Devolver el valor promedio, máximo y mínimo de pagos que se hacen por mes.
SELECT 
    AVG(amount) AS avg_amount,
    MIN(amount) AS min_amount,
    MAX(amount) AS max_amount,
    YEAR(paymentDate) AS payment_year,
    MONTH(paymentDate) AS payment_month
FROM payments
GROUP BY payment_year, payment_month
ORDER BY payment_year, payment_month;


-- 4. Crear un procedimiento "Update Credit" en donde se modifique el límite de crédito de un cliente con un valor pasado por parámetro.
DELIMITER $$
CREATE PROCEDURE update_credit(IN _customerNumber INT, IN _creditLimit DECIMAL(10,2))
BEGIN
    UPDATE customers
    SET creditLimit = _creditLimit
    WHERE customerNumber = _customerNumber; 
END $$
DELIMITER ;


-- 5. Cree una vista "Premium Customers" que devuelva el top 10 de clientes que más dinero han gastado en la plataforma. 
-- La vista deberá devolver el nombre del cliente, la ciudad y el total gastado por ese cliente en la plataforma.
CREATE VIEW premium_customers AS
    SELECT c.customerName, c.city, SUM(p.amount)
    FROM customers AS c
    JOIN payments AS p ON p.customerNumber = c.customerNumber
    GROUP BY c.customerNumber
    ORDER BY SUM(p.amount) DESC
    LIMIT 10;



-- 6. Cree una función "employee of the month" que tome un mes y un año y devuelve el empleado (nombre y apellido)
-- cuyos clientes hayan efectuado la mayor cantidad de órdenes en ese mes.
DELIMITER $$
CREATE FUNCTION employee_of_the_month(monthNumber INT, yearNumber INT)
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    DECLARE employee VARCHAR(50);
    SET employee = (
        SELECT CONCAT(e.firstName, ' ', e.lastName)
        FROM orders AS o
        JOIN customers AS c ON c.customerNumber = o.customerNumber
        JOIN employees AS e ON e.employeeNumber = c.salesRepEmployeeNumber
        WHERE MONTH(o.orderDate) = monthNumber AND YEAR(o.orderDate) = yearNumber
        GROUP BY e.employeeNumber
        ORDER BY COUNT(o.orderNumber) DESC
        LIMIT 1
    );

    RETURN employee;
END $$
DELIMITER ;



-- 7. Crear una nueva tabla "Product Refillment". Deberá tener una relación varios a uno con "products" y los campos: 
-- `refillmentID`, `productCode`, `orderDate`, `quantity`.

DROP TABLE IF EXISTS product_refillment;
CREATE TABLE product_refillment (
    refillmentID INT NOT NULL AUTO_INCREMENT,
    productCode VARCHAR(15) NOT NULL,
    orderDate DATE NOT NULL,
    quantity INT NOT NULL,
    PRIMARY KEY (refillmentID, productCode),
    FOREIGN KEY (productCode) REFERENCES products(productCode)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- 8. Definir un trigger "Restock Product" que esté pendiente de los cambios efectuados en `orderdetails` y cada vez 
-- que se agregue una nueva orden revise la cantidad de productos pedidos (`quantityOrdered`) y compare con la cantidad 
-- en stock (`quantityInStock`) y si es menor a 10 genere un pedido en la tabla "Product Refillment" por 10 nuevos productos.

DELIMITER $$
CREATE FUNCTION get_quantity_in_stock(_productCode INT)
RETURNS INT
DETERMINISTIC
BEGIN
    RETURN (
        SELECT quantityInStock 
        FROM products 
        WHERE productCode = _productCode
    );
END $$
DELIMITER ;


DELIMITER $$
CREATE TRIGGER restock_product AFTER INSERT
ON orderdetails FOR EACH ROW
BEGIN
    UPDATE products
    SET quantityInStock = get_quantity_in_stock(NEW.productCode) - NEW.quantityOrdered;

    IF (SELECT quantityInStock 
        FROM products 
        WHERE productCode=NEW.productCode
    ) < 10 THEN
        INSERT INTO product_refillment (productCode, orderDate, quantity)
        SELECT 
            NEW.productCode, 
            (SELECT orderDate FROM orders WHERE orderNumber = NEW.orderNumber),
            10;
    END IF ;
END $$
DELIMITER ;

-- 9. Crear un rol "Empleado" en la BD que establezca accesos de lectura a todas las tablas y accesos de creación de vistas.
CREATE ROLE employee;
GRANT SELECT, CREATE VIEW ON classicmodels.* TO employee;