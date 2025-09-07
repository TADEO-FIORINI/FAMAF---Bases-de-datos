-- 1. Devuelva una lista de los nombres y las regiones a las que pertenece cada país ordenada alfabéticamente
SELECT Name, Region
FROM Country
ORDER BY Name ASC;

-- 2. Liste el nombre y la población de las 10 ciudades más pobladas del mundo.
SELECT Name, Population
FROM City
ORDER BY Population DESC
LIMIT 10;

-- 3. Liste el nombre, región, superficie y forma de gobierno de los 10 países con menor superficie.
SELECT Name, SurfaceArea, GovernmentForm 
FROM Country
ORDER BY SurfaceArea
LIMIT 10;

-- 4. Liste todos los países que no tienen independencia (hint: ver que define la independencia de un país en la BD).
SELECT Name
FROM Country
WHERE IndepYear IS NULL;

-- 5. Liste el nombre y el porcentaje de hablantes que tienen todos los idiomas declarados oficiales.
SELECT Country.Name, Language, Percentage 
FROM CountryLanguage
JOIN Country ON CountryCode = Country.Code
WHERE IsOfficial = 'T';

--6. Actualizar el valor de porcentaje del idioma inglés en el país con código 'AIA' a 100.0
SELECT Percentage
FROM CountryLanguage
WHERE Language = 'English' AND CountryCode = 'AIA'; -- Esto da 0, verificar que luego de la sgt consulta de 100

UPDATE CountryLanguage
SET Percentage = (100.0)
WHERE Language = 'English' AND CountryCode = 'AIA';

--7. Listar las ciudades que pertenecen a Córdoba (District) dentro de Argentina. 
SELECT Name 
FROM City
WHERE District = 'Córdoba' AND CountryCode = 'ARG';

--8. Eliminar todas las ciudades que pertenezcan a Córdoba fuera de Argentina.
SELECT *
FROM City
WHERE District = 'Córdoba';
-- +------+-----------+-------------+----------+------------+
-- | ID   | Name      | CountryCode | District | Population |
-- +------+-----------+-------------+----------+------------+
-- | 2276 | Montería  | COL         | Córdoba  |     248245 |
-- +------+-----------+-------------+----------+------------+
DELETE FROM City
WHERE District = 'Córdoba' AND CountryCode != "ARG";

--9. Listar los países cuyo Jefe de Estado se llame John.
SELECT *
FROM Country
WHERE HeadOfState LIKE '%John%'

--10. Listar los países cuya población esté entre 35 M y 45 M ordenados por población de forma descendente.
SELECT *
FROM Country 
WHERE Population BETWEEN 35000000 AND 45000000
ORDER BY Population DESC; 
