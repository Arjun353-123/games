# How to Build APK for KIBORI Gaming App

## Option 1: Build with Android Studio (Recommended)

1. **Open Android Studio**
2. **Open Project**: Open the folder `games/android` in Android Studio
3. **Wait for Gradle Sync** to complete
4. **Build APK**:
   - Go to `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - Or use menu: `Build` → `Generate Signed Bundle / APK`
5. **Find APK**: 
   - Location: `games/android/app/build/outputs/apk/debug/app-debug.apk`

## Option 2: Command Line (If OneDrive issue persists)

### Step 1: Move Project Out of OneDrive
OneDrive causes file locking issues. Move the project:
```powershell
# Move project to C drive
Copy-Item -Path "C:\Users\Arjun\OneDrive\Desktop\GAMES.APP\games" -Destination "C:\GAMES_PROJECT" -Recurse
cd C:\GAMES_PROJECT
```

### Step 2: Build APK
```powershell
cd android
.\gradlew.bat assembleDebug
```

### Step 3: Find APK
```
C:\GAMES_PROJECT\android\app\build\outputs\apk\debug\app-debug.apk
```

## Option 3: Online Build Service (Easiest)

### Using Expo EAS or Similar:
1. Push code to GitHub
2. Use services like:
   - **Expo EAS Build** (https://expo.dev/)
   - **AppCenter** (https://appcenter.ms/)
   - **Codemagic** (https://codemagic.io/)

## Option 4: Build Release APK (Signed)

### Create Keystore:
```powershell
cd android/app
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### Update gradle.properties:
```
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=your_password
MYAPP_RELEASE_KEY_PASSWORD=your_password
```

### Build Release:
```powershell
cd android
.\gradlew.bat assembleRelease
```

APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

## Quick Fix for Current Issue

The build is failing because of OneDrive file sync. Quick solutions:

1. **Pause OneDrive sync** while building
2. **Exclude android/build folder** from OneDrive
3. **Move project** to non-OneDrive location (C:\Projects\)

## Current Project Info

- **App Name**: Games App (KIBORI GAMING)
- **Package**: com.gamesapp.app
- **Features**: 7 games, login system, Kibori 3D Arena
- **Theme**: White background with black text
- **Build Tool**: Capacitor 8.5.2 + Android Gradle Plugin

## Install APK on Phone

1. Copy APK to phone via USB or cloud
2. Enable "Install from Unknown Sources" in phone settings
3. Open APK file on phone
4. Click Install

---

**Note**: The web app is already built and synced to Android. The issue is only with the final APK build step due to OneDrive file locking.
