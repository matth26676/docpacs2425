@echo off
setlocal enabledelayedexpansion

:: Store the current directory
set "origDir=%cd%"

:: Loop through each subfolder in the current directory
for /d %%D in (*) do (
    if exist "%%D\*.js" (
        echo Processing folder: %%D
        cd "%%D"
        
        :: Run npm install
        echo Running npm install in %%D...
        npm install
        
        :: Find the first .js file in the folder
        for %%F in (*.js) do (
            set "firstJsFile=%%F"
            goto :runJs
        )
        
        :runJs
        echo Running Node on !firstJsFile! in %%D...
        node "!firstJsFile!"

        :: Return to the original directory after Node finishes
        cd "%origDir%"
    )
)

echo All done.
pause
