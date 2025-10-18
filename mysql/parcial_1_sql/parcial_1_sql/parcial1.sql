-- NOTA:
-- En varios ejercicios usamos algo como
-- SUM(od.Quantity * (p.UnitPrice - od.UnitPrice * od.Discount))
-- que se refiere a la cantidad de dinero recaudado con la venta de productos, 
-- aplicando los descuentos correspondientes

-- su usamos simplemente algo como
-- SUM(od.Quantity) 
-- lo que obtenemos es la cantidad de items vendidos

-- El profesor nos indico que utilicemos la cantidad de dinero recaudada
-- para todos los ejercicios que pidan datos de ese estilo


-- 1.  Listar los 5 clientes que más ingresos han generado a lo largo del tiempo. 
SELECT
    c.CustomerID, 
    SUM(od.Quantity * (od.UnitPrice - od.UnitPrice * od.Discount)) AS total_recaudado
FROM Orders AS o
JOIN Customers AS c ON o.CustomerID = c.CustomerID
JOIN `Order Details` AS od ON o.OrderID = od.OrderID
GROUP BY c.CustomerID
ORDER BY total_recaudado DESC
LIMIT 5;


-- 2.  Listar cada producto con sus ventas totales, agrupados por categoría. 
SELECT 
    c.CategoryName AS category_name,
    p.ProductName AS product_name, 
    SUM(od.Quantity * (od.UnitPrice - od.UnitPrice * od.Discount)) AS total_recaudado
FROM Products AS p 
JOIN `Order Details` AS od ON p.ProductID = od.ProductID
JOIN Categories AS c ON p.CategoryID = c.CategoryID
GROUP BY p.ProductID, c.CategoryID;


-- 3.  Calcular el total de ventas para cada categoría. 
SELECT c.CategoryName AS category_name, 
    SUM(od.Quantity * (od.UnitPrice - od.UnitPrice * od.Discount)) AS total_recaudado
FROM Products AS p 
JOIN `Order Details` AS od ON p.ProductID = od.ProductID
JOIN Categories AS c ON p.CategoryID = c.CategoryID
GROUP BY c.CategoryID;


-- 4.  Crear una vista que liste los empleados con más ventas por cada año, mostrando 
-- empleado, año y total de ventas. Ordenar el resultado por año ascendente. 
DELIMITER $$
CREATE FUNCTION empleado_con_mas_ventas(_year_venta INT)
    RETURNS INTEGER
    DETERMINISTIC
    BEGIN
        DECLARE employee INT;
        
        SELECT employee_id
        INTO employee
        FROM (
            SELECT 
                e.EmployeeID AS employee_id,
                SUM(od.Quantity * (p.UnitPrice - od.UnitPrice * od.Discount)) AS total_recaudado
            FROM `Order Details` AS od
            JOIN Orders AS o ON od.OrderID = o.OrderID
            JOIN Employees AS e ON o.EmployeeID = e.EmployeeID
            JOIN Products AS p ON od.ProductID = p.ProductID
            WHERE YEAR(o.OrderDate) = _year_venta
            GROUP BY e.EmployeeID
            ORDER BY SUM(od.Quantity) DESC
            LIMIT 1
        ) AS venta_anios
        ORDER BY total_recaudado DESC;
        
        RETURN employee;
    END $$
DELIMITER ;

DELIMITER $$
CREATE FUNCTION max_ventas(_year_venta INT)
    RETURNS INTEGER
    DETERMINISTIC
    BEGIN
        DECLARE ventas INT;
        
        SELECT total_recaudado
        INTO ventas
        FROM (
            SELECT 
                e.EmployeeID AS employee_id,
                SUM(od.Quantity * (p.UnitPrice - od.UnitPrice * od.Discount)) AS total_recaudado
            FROM `Order Details` AS od
            JOIN Orders AS o ON od.OrderID = o.OrderID
            JOIN Employees AS e ON o.EmployeeID = e.EmployeeID
            JOIN Products AS p ON od.ProductID = p.ProductID
            WHERE YEAR(o.OrderDate) = _year_venta
            GROUP BY e.EmployeeID
            ORDER BY SUM(od.Quantity) DESC
            LIMIT 1
        ) AS venta_anios
        ORDER BY total_recaudado DESC;
        
        RETURN ventas;
    END $$
DELIMITER ;


CREATE VIEW all_years AS
SELECT DISTINCT YEAR(OrderDate) AS order_year
FROM Orders;


SELECT DISTINCT
    CONCAT(e.FirstName, ' ', e.LastName),
    ay.order_year,
    max_ventas(ay.order_year)
FROM `Order Details` AS od
JOIN Orders AS o ON od.OrderID = o.OrderID
JOIN Employees AS e ON o.EmployeeID = e.EmployeeID
JOIN all_years AS ay ON TRUE
WHERE e.EmployeeID = empleado_con_mas_ventas(ay.order_year)
ORDER BY ay.order_year;


-- 5.  Crear un trigger que se ejecute después de insertar un nuevo registro en la tabla 
-- Order  Details. Este trigger debe actualizar la tabla Products para disminuir la 
-- cantidad  en  stock  (UnitsInStock)  del  producto  correspondiente,  restando  la 
-- cantidad (Quantity) que se acaba de insertar en el detalle del pedido. 
DELIMITER $$
CREATE TRIGGER update_products AFTER INSERT
ON `Order Details` FOR EACH ROW
BEGIN 
    UPDATE Products AS p
    SET p.UnitsInStock = p.UnitsInStock - NEW.Quantity
    WHERE p.ProductID = NEW.ProductID;
END $$
DELIMITER ;


-- 6.  Crear un rol llamado admin y otorgarle los siguientes permisos: 
-- ●  crear registros en la tabla Customers. 
-- ●  actualizar solamente la columna Phone de Customers. 
CREATE ROLE `admin`;
GRANT INSERT, UPDATE(Phone) ON northwind.Customers TO `admin`;