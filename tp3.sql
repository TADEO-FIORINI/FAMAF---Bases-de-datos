-- 1.  Lista el nombre de la ciudad, nombre del país, región y forma de gobierno de las 10 ciudades más pobladas del mundo.
SELECT City.Name, Country.Region, Country.GovernmentForm
FROM City
LEFT OUTER JOIN Country ON City.CountryCode = Country.Code
ORDER BY City.Population DESC
LIMIT 10;


-- 2. Listar los 10 países con menor población del mundo, junto a sus ciudades capitales (Hint: puede que uno de estos 
--    países no tenga ciudad capital asignada, en este caso deberá mostrar "NULL").
SELECT Country.Name AS CountryName, City.Name AS CityName 
FROM Country
LEFT OUTER JOIN City ON Country.Capital = City.ID
ORDER BY Country.Population ASC
LIMIT 10;


-- 3. Listar el nombre, continente y todos los lenguajes oficiales de cada país. (Hint: habrá más de una fila por país 
--    si tiene varios idiomas oficiales).
SELECT Country.Name AS CountryName, Continent.Name AS ContinentName, CountryLanguage.Language
FROM Country
JOIN CountryLanguage ON Country.Code = CountryLanguage.CountryCode
JOIN Continent ON Country.Continent = Continent.Name;


-- 4. Listar el nombre del país y nombre de capital, de los 20 países con mayor superficie del mundo.
SELECT Country.Name AS CountryName, City.Name AS CityName
FROM Country
LEFT JOIN City ON Country.Capital = City.ID
ORDER BY Country.SurfaceArea DESC
LIMIT 20;


-- 5. Listar los paises junto a sus idiomas oficiales (ordenado por la población del pais) y el porcentaje de hablantes del idioma.
SELECT Country.Name, CountryLanguage.Language, CountryLanguage.Percentage
FROM Country
JOIN CountryLanguage ON Country.Code = CountryLanguage.CountryCode
WHERE CountryLanguage.IsOfficial = 'T'
ORDER BY Country.Population DESC, CountryLanguage.Percentage DESC;


-- 6. Listar los 10 países con mayor población y los 10 países con menor población (que tengan al menos 100 habitantes) en la misma consulta.
(SELECT Name, Population 
FROM Country 
ORDER BY Population DESC
LIMIT 10)
UNION
(SELECT Name, Population 
FROM Country 
WHERE Population >= 100
ORDER BY Population ASC
LIMIT 10);


-- 7. Listar aquellos países cuyos lenguajes oficiales son el Inglés y el Francés (hint: no debería haber filas duplicadas).
(SELECT Country.Name
FROM Country
JOIN CountryLanguage ON Country.Code = CountryLanguage.CountryCode
WHERE CountryLanguage.IsOfficial = 'T' AND CountryLanguage.Language = "French")
INTERSECT
(SELECT Country.Name
FROM Country
JOIN CountryLanguage ON Country.Code = CountryLanguage.CountryCode
WHERE CountryLanguage.IsOfficial = 'T' AND CountryLanguage.Language = "English");


-- 8. Listar aquellos países que tengan hablantes del Inglés pero no del Español en su población.
(SELECT Country.Name
FROM Country
JOIN CountryLanguage ON Country.Code = CountryLanguage.CountryCode
WHERE CountryLanguage.Language = 'English')
EXCEPT
(SELECT Country.Name 
FROM Country
JOIN CountryLanguage ON Country.Code = CountryLanguage.CountryCode
WHERE CountryLanguage.Language = "Spanish");
