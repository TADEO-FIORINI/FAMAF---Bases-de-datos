CREATE DATABASE IF NOT EXISTS world;

USE wold;

CREATE TABLE IF NOT EXISTS Country(
    Code varchar(3) NOT NULL,
    Name varchar(255),
    Continent varchar(255),
    Region varchar(255),
    SurfaceArea float,
    IndepYear int,
    Population int,
    LifeExpentancy float,
    GNP float,
    GNPOld float,
    LocalName varchar(255),
    GovernmentForm varchar(255),
    HeadOfState varchar(255),
    Capital int,
    Code2 varchar(255),
    PRIMARY KEY (Code)
);

CREATE TABLE IF NOT EXISTS City(
    ID int NOT NULL,
    Name varchar(255),
    CountryCode varchar(3) NOT NULL,
    District varchar(255),
    Population int,
    PRIMARY KEY (ID),
    FOREIGN KEY (CountryCode) REFERENCES Country(Code)
);

CREATE TABLE IF NOT EXISTS CountryLanguage(
    CountryCode varchar(3) NOT NULL,
    Language varchar(255) NOT NULL,
    IsOfficial varchar(1),
    Percentage float,
    PRIMARY KEY (CountryCode, Language),
    FOREIGN KEY (CountryCode) REFERENCES Country(Code)
);

CREATE TABLE IF NOT EXISTS Continent(
    Name varchar(255) NOT NULL, 
    MostPopulatedCityID int,
    Area int,
    Percentage float,
    PRIMARY KEY (Name),
    FOREIGN KEY (MostPopulatedCityID) REFERENCES City(ID)  
);

ALTER TABLE Country
ADD FOREIGN KEY (Continent) REFERENCES Continent(Name);

INSERT INTO Continent (Name, Area, Percentage, MostPopulatedCityID) 
VALUES ("Africa", 30370000, 20.4, NULL);


INSERT INTO Continent (Name, Area, Percentage, MostPopulatedCityID)
VALUES("Asia", 44579000, 29.5, NULL
);

INSERT INTO Continent (Name, Area, Percentage, MostPopulatedCityID)
VALUES ("Europe", 10180000, 6.8, NULL);

INSERT INTO Continent (Name, Area, Percentage, MostPopulatedCityID)
VALUES ("North America", 24709000, 16.5, NULL);

INSERT INTO Continent (Name, Area, Percentage, MostPopulatedCityID)
VALUES("Oceania", 8600000, 5.9, NULL);

INSERT INTO Continent (Name, Area, Percentage, MostPopulatedCityID)
VALUES ("South America", 17840000, 12.0, NULL);

-- now insert data world.txt

UPDATE Continent
SET MostPopulatedCityID = (
    SELECT ID FROM City
    WHERE Name="Cairo" AND CountryCode = (
        SELECT Code FROM Country
        WHERE Name="Egypt")
    )
WHERE Name = "Africa";


UPDATE Continent
SET MostPopulatedCityID = (
    SELECT ID FROM City
    WHERE Name="Mumbai (Bombay)" AND CountryCode = (
        SELECT Code FROM Country
        WHERE Name="India"
    )
)
WHERE Name = "Asia";


UPDATE Continent
SET MostPopulatedCityID = (
    SELECT ID FROM City
    WHERE Name = "Istanbul" AND CountryCode = (
        SELECT Code FROM Country
        WHERE Name = "Turkey"
    )
)
WHERE Name = "Europe";


UPDATE Continent
SET MostPopulatedCityID = (
    SELECT ID FROM City
    WHERE Name = "Ciudad de México" AND CountryCode = (
        SELECT Code FROM Country
        WHERE Name = "Mexico"
    )
)
WHERE Name = "North America";


UPDATE Continent
SET MostPopulatedCityID = (
    SELECT ID FROM City
    WHERE Name = "Sydney" AND CountryCode = (
        SELECT Code FROM Country 
        WHERE Name = "Australia"
    )
)
WHERE Name = "Oceania";


UPDATE Continent
SET MostPopulatedCityID = (
    SELECT ID FROM City
    WHERE Name = "São Paulo" and CountryCode = (
        SELECT Code From Country
        WHERE Name = "Brazil"
    )
)
WHERE Name = "South America";