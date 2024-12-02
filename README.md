# Uforum

Uforum es un foro universitario creado para facilitar la interacción entre estudiantes de la Universidad Gerardo Barrios (UGB). Es una plataforma donde los estudiantes pueden crear publicaciones, comentar, reaccionar, y participar en chats en tiempo real. El objetivo principal es construir una comunidad donde estudiantes nuevos y de antiguo ingreso puedan compartir ideas, resolver dudas y hacer amigos.

## INSTALACION 🚀

Estas instrucciones te permitirán obtener una copia del proyecto en funcionamiento en tu máquina local para propósitos de desarrollo y pruebas.



## Pre-requisitos 📋

Antes de instalar el proyecto, asegúrate de contar con:

- **Node.js** (versión 16 o superior)  
- **Git** (para clonar el repositorio)  
- **Base de datos MySQL** (versión 8.0 o superior)  
- **Editor de código** ( Visual Studio Code)

Ejemplo de instalación:  

sudo apt install nodejs
sudo apt install git

## Instalación 🔧
Sigue estos pasos para tener el entorno de desarrollo funcionando:

Clonar el repositorio:



git clone https://github.com/DavidQ12/uforum.git
```bash
Acceder al directorio del proyecto:
cd uforum
Instalar las dependencias necesarias:



npm install
Configurar las variables de entorno
Crea un archivo .env con las siguientes variables:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1234567
DB_NAME=uforum
PORT=3000
Configurar la base de datos:

Crea la base de datos uforum en MySQL.
Importa el archivo schema.sql del repositorio.
Iniciar el servidor
npm start
Accede al proyecto en http://localhost:3000.
```
## Autores ✒️
David Q12 - GitHub
