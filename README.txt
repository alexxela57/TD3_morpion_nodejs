afin d'tiliser l'application du morpion du TD9 (que l'on peut retrouver dans le fichier TD9), 
il faut tout d'abord avoir node.js et PostgreSQL installé sur votre machine.

Installation

cloner le dépôt
Installer les dépendances : 
	cd morpion-api-spa
	npm install

Configurer la base de données
	Se connecter à la base (sudo -u postgre sql)
	Créer la base de données (CREATE DATABASE MORPION;
				  CREATE USER morpion_user WITH ENCRYPTED PASSWORD 'password';
				  GRANT ALL PRIVILEGES ON DATABASE morpion TO morpion_user';
	quitter psql (\q)

Modifier le fichier pg_hba.conf'
	Allez dans vortre fichier pg_hba.conf
	changer la ligne 'local	all	postgres' en 'local	all	morpion_user	md5'
	Redémarer PostgreSQL (sudo systemctl restart postgresql

Ajout de la table games
	entrer dans la base (sudo -u morpion_user psql -d morpion)
	créer la table : CREATE TABLE games (
			id SERIAL PRIMARY KEY,
			state JSON NOT NULL,
			player VARCHAR(1) NOT NULL,
			winner VARCHAR(1));
	Quittez la base de données(\q)

Les fichiers de configuration 
	à la base de votre projet, créez un fichier '.env' avec ce contenu : 
	DATABASE_URL=postgres://morpion_user:your_password@localhost:5432/morpion

Lancer le projet : 
	Dans un terminal (node morpion-api.js)
	Dans un autre terminal (npm start)
