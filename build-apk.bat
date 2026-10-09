@echo off
echo ============================================
echo KIBORI GAMING - APK Builder
echo ============================================
echo.

echo Step 1: Building web app...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Web build failed!
    pause
    exit /b 1
)
echo ✓ Web build completed
echo.

echo Step 2: Syncing to Android...
call npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Capacitor sync failed!
    pause
    exit /b 1
)
echo ✓ Android sync completed
echo.

echo Step 3: Stopping Gradle daemons...
cd android
call gradlew.bat --stop
cd ..
echo ✓ Gradle daemons stopped
echo.

echo Step 4: Building APK (this may take a while)...
echo NOTE: If this fails, please:
echo   1. Pause OneDrive sync
echo   2. Close Android Studio
echo   3. Run this script again
echo.
cd android
call gradlew.bat clean assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ============================================
    echo BUILD FAILED!
    echo ============================================
    echo.
    echo Common solutions:
    echo   1. Pause OneDrive sync and try again
    echo   2. Open Android Studio and build there
    echo   3. Move project out of OneDrive folder
    echo.
    echo See BUILD_APK_GUIDE.md for detailed instructions
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ============================================
echo ✓ APK BUILD SUCCESSFUL!
echo ============================================
echo.
echo APK Location:
echo   android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo To install on phone:
echo   1. Copy APK to your phone
echo   2. Enable "Install from Unknown Sources"
echo   3. Open APK file and install
echo.
echo Opening APK folder...
start "" "android\app\build\outputs\apk\debug"

pause
