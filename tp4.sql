--1. Listar el nombre de la ciudad y el nombre del país de todas las ciudades que pertenezcan a países con una población menor a 10000 habitantes.
SELECT City.Name, Country.Name
FROM City
JOIN Country
ON CountryCode = Country.Code
WHERE Country.Population < 10000;


--2. Listar todas aquellas ciudades cuya población sea mayor que la población promedio entre todas las ciudades.
SELECT Name, Population
FROM City
WHERE Population > (
    SELECT AVG(Population)
    FROM City
)


--3. Listar todas aquellas ciudades no asiáticas cuya población sea igual o mayor a la población total de algún país de Asia.
SELECT City.Name
FROM City
JOIN Country
ON CountryCode = Country.Code
WHERE Country.Continent != "Asia" AND City.Population >= (
    SELECT MIN(Population)
    FROM Country
    WHERE Continent = "Asia"
);


--4. Listar aquellos países junto a sus idiomas no oficiales, que superen en porcentaje de hablantes a cada uno de los idiomas oficiales del país.
SELECT Country.Name, Language
FROM CountryLanguage
JOIN Country
ON CountryCode = Country.Code
WHERE IsOfficial = 'F' AND Percentage > (
    SELECT MAX(Percentage)
    FROM CountryLanguage
    WHERE CountryCode = Country.Code
    AND IsOfficial = 'T'
);


--5. Listar (sin duplicados) aquellas regiones que tengan países con una superficie menor a 1000 km2 y exista (en el país) al menos
--   una ciudad con más de 100000 habitantes. (Hint: Esto puede resolverse con o sin una subquery, intenten encontrar ambas respuestas).
SELECT Country.Region
FROM City
JOIN Country
ON CountryCode = Country.Code
WHERE Country.SurfaceArea < 1000
AND City.Population > 100000
GROUP BY Country.Region;


--6. Listar el nombre de cada país con la cantidad de habitantes de su ciudad más poblada.
--   (Hint: Hay dos maneras de llegar al mismo resultado. Usando consultas escalares o usando agrupaciones, encontrar ambas).
SELECT Country.Name, MAX(City.Population) 
FROM City
JOIN Country
ON CountryCode = Country.Code
GROUP BY CountryCode;


SELECT Country.Name, City.Population
FROM City
JOIN Country
ON CountryCode = Country.Code
WHERE City.Population = (
    SELECT MAX(Population)
    FROM City
    WHERE CountryCode = Country.Code
);


--7. Listar aquellos países y sus lenguajes no oficiales cuyo porcentaje de hablantes sea mayor al promedio de hablantes de los lenguajes oficiales.


--8. Listar la cantidad de habitantes por continente ordenado en forma descendente.


--9. Listar el promedio de esperanza de vida (LifeExpectancy) por continente con una esperanza de vida entre 40 y 70 años.


--10. Listar la cantidad máxima, mínima, promedio y suma de habitantes por continente.

