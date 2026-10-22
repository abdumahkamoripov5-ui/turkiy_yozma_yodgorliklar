@echo off
cd /d "%~dp0"
if exist ".venv\Scripts\python.exe" (
  ".venv\Scripts\python.exe" start_mvp.py
) else (
  python start_mvp.py
)
if errorlevel 1 pause
