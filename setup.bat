@echo off
echo ============================================
echo   ZYGERRIA MAP - INSTALACION Y CONFIGURACION
echo ============================================
echo.

echo [1/4] Instalando dependencias del backend...
cd backend
call npm install
if %errorlevel% neq 0 (
  echo ERROR: Fallo al instalar dependencias del backend
  pause
  exit /b 1
)
cd ..

echo.
echo [2/4] Instalando dependencias del frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
  echo ERROR: Fallo al instalar dependencias del frontend
  pause
  exit /b 1
)
cd ..

echo.
echo [3/4] Verificando imagen del mapa...
if exist "frontend\public\mapa.jpg" (
  echo OK: mapa.jpg encontrada en frontend/public/
) else (
  echo ADVERTENCIA: mapa.jpg no encontrada. Copiando...
  copy "mapa.jpg" "frontend\public\mapa.jpg" >nul 2>&1
  if %errorlevel% neq 0 (
    echo ERROR: No se pudo copiar mapa.jpg
  ) else (
    echo OK: mapa.jpg copiada correctamente
  )
)

echo.
echo [4/4] Configuracion de base de datos...
echo.
echo INSTRUCCIONES PARA LA BASE DE DATOS:
echo.
echo   OPCION A - Docker (recomendado):
echo     docker-compose up -d
echo     (Espera 30 segundos y ejecuta: cd backend ^&^& npm run seed)
echo.
echo   OPCION B - SQL Server local:
echo     1. Asegurate de que SQL Server esta corriendo
echo     2. Edita backend\.env con tus credenciales
echo     3. Ejecuta: cd backend ^&^& npm run seed
echo.
echo ============================================
echo   PARA INICIAR LA APLICACION:
echo ============================================
echo.
echo   Terminal 1 (Backend):
echo     cd backend
echo     npm run dev
echo.
echo   Terminal 2 (Frontend):
echo     cd frontend
echo     npm run dev
echo.
echo   La aplicacion estara disponible en:
echo     http://localhost:5173
echo.
echo   Usuario admin: starwarsrol / starwarsrol
echo.
echo ============================================
pause
