@echo off
for /d %%d in (*) do (
    if exist "%%d\node_modules" (
        echo Deleting node_modules in %%d
        rd /s /q "%%d\node_modules"
    )
)
pause
