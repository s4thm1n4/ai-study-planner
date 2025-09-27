@echo off
cd /d "e:\ITProject\ai-study-planner\backend"
call "E:/ITProject/ai-study-planner/venv/Scripts/activate.bat"
python -m uvicorn main:app --reload
pause