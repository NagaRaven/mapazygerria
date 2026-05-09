-- Crear base de datos si no existe
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'zygerria_map')
BEGIN
  CREATE DATABASE zygerria_map;
END
GO

USE zygerria_map;
GO

-- Tabla de usuarios
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
BEGIN
  CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
  );
END
GO

-- Tabla de puntos de interés
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='points_of_interest' AND xtype='U')
BEGIN
  CREATE TABLE points_of_interest (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    faction NVARCHAR(100),
    activities NVARCHAR(MAX),
    x_percent DECIMAL(6,3) NOT NULL,
    y_percent DECIMAL(6,3) NOT NULL,
    image_url NVARCHAR(500),
    created_by INT FOREIGN KEY REFERENCES users(id),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
  );
END
GO

PRINT 'Base de datos inicializada correctamente';
GO
