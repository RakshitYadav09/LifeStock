@echo off
echo Starting LifeStock Development Environment...
echo.

echo Starting MongoDB (if not already running)...
echo Make sure MongoDB is installed and running on your system
echo.

echo Starting Backend Server...
start "LifeStock Backend" cmd /k "cd /d %~dp0server && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Client...
start "LifeStock Frontend" cmd /k "cd /d %~dp0client && npm start"

echo.
echo LifeStock is starting up!
echo.
echo Backend will be available at: http://localhost:5000
echo Frontend will be available at: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul
