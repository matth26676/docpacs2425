@echo off
for /d %%d in (*) do (
    if exist "%%d\package.json" (
        echo Installing in %%d
        cd "%%d"
        npm install
        cd ..
    )
)
pause
