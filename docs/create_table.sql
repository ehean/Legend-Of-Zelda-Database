CREATE TABLE Games (
	id INT(11) AUTO_INCREMENT NOT NULL,
	title VARCHAR(255) NOT NULL,
	yearReleased DATE,
	sales FLOAT(11),
	PRIMARY KEY (id)
) ENGINE = InnoDB;

CREATE TABLE Consoles (
	id INT(11) AUTO_INCREMENT NOT NULL,
	name VARCHAR(255) NOT NULL,
	yearReleased DATE,
	sales FLOAT(11),
	handheld BOOLEAN,
	PRIMARY KEY (id)
) ENGINE = InnoDB;

CREATE TABLE Locations (
	id INT(11) AUTO_INCREMENT NOT NULL,
	name VARCHAR(255) NOT NULL,
	PRIMARY KEY (id),
) ENGINE = InnoDB;

CREATE TABLE Characters (
	id INT(11) AUTO_INCREMENT NOT NULL,
	locationID INT(11) NOT NULL,
	name VARCHAR(255) NOT NULL,
	FOREIGN KEY (locationID) REFERENCES Locations(id)
	ON DELETE CASCADE, 
	PRIMARY KEY (id)
) ENGINE = InnoDB;

CREATE TABLE Games_Consoles (
	gameID INT(11),
	consoleID INT(11) NOT NULL,
	FOREIGN KEY (gameID) REFERENCES Games(id)
	ON DELETE CASCADE,
	FOREIGN KEY (consoleID) REFERENCES Consoles(id)
	ON DELETE CASCADE,
	PRIMARY KEY (gameID, consoleID)
) ENGINE = InnoDB;

CREATE TABLE Games_Characters (
	gameID INT(11) NOT NULL,
	characterID INT(11) NOT NULL,
	FOREIGN KEY (gameID) REFERENCES Games(id)
	ON DELETE CASCADE,
	FOREIGN KEY (characterID) REFERENCES Characters(id)
	ON DELETE CASCADE,
	PRIMARY KEY (gameID, characterID)
) ENGINE = InnoDB;