@echo off
REM Randomize answers for all exams and capture output to log file
REM Usage: run_randomize_all.bat

setlocal enabledelayedexpansion

REM Get timestamp for log filename
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set timestamp=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%%datetime:~10,2%%datetime:~12,2%

REM Set paths
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..
set LOG_DIR=%PROJECT_ROOT%\log\randomize
set LOG_FILE=%LOG_DIR%\randomize_%timestamp%.log

REM Create log directory if it doesn't exist
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo Randomizing exam answers...
echo Log file: %LOG_FILE%
echo.

REM Run the randomization script and capture all output
python "%SCRIPT_DIR%randomize_answers.py" > "%LOG_FILE%" 2>&1

REM Check exit code
if %ERRORLEVEL% EQU 0 (
    echo [OK] Randomization complete. See log for details.
) else (
    echo [ERROR] Randomization failed with exit code %ERRORLEVEL%
)

echo.
echo Log saved to: %LOG_FILE%

endlocal
