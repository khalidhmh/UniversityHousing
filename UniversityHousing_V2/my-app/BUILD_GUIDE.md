# Phase 9: Production Build & Packaging Guide

## Overview
This guide walks you through creating a professional Windows installer (.exe) for the University Housing Management System using Electron Builder.

## Prerequisites
- Node.js and npm installed
- All dependencies installed: `npm install`
- React-to-print dependency: `npm install react-to-print`

## Build Configuration

### 1. Package.json Configuration ✅
Your `package.json` is already configured with:
- **App ID**: `com.university.housing`
- **Product Name**: `University Housing System`
- **Windows Target**: NSIS installer
- **Output Directory**: `dist/`
- **Icon**: `build/icon.ico` ✅ (already exists)
- **Desktop Shortcut**: Enabled
- **Custom Installation Directory**: Enabled

### 2. Icon File ✅
The icon file is already placed at:
```
build/icon.ico
```

## Build Commands

### Development Build (for testing)
```bash
npm run build:unpack
```
Creates an unpacked folder in `dist/` without creating an installer.

### Production Installer
```bash
npm run build:win
```
Creates a professional NSIS installer in `dist/`.

### All Platforms
```bash
npm run build        # Windows only
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## Database Handling in Production ✅

The application is already configured for production database handling:

### Database Location
- **Development**: `prisma/dev.db`
- **Production**: `%APPDATA%/University Housing Management/database/`

### Automatic Database Creation
The app automatically:
1. Creates the database directory if it doesn't exist
2. Initializes a new SQLite database if none is found
3. Runs Prisma migrations on first startup

### Database Files Included
The build configuration includes:
- Prisma schema files
- Generated Prisma client
- Migration files

## Installer Features

Your NSIS installer includes:
- ✅ Professional installer wizard
- ✅ Custom installation directory selection
- ✅ Desktop shortcut creation
- ✅ Start Menu shortcut creation
- ✅ Proper Windows registry entries
- ✅ Uninstaller support

## Build Process

### Step 1: Install Dependencies
```bash
npm install
npm install react-to-print  # Required for printing features
```

### Step 2: Generate Prisma Client
```bash
npx prisma generate
```

### Step 3: Build Application
```bash
npm run build:win
```

### Step 4: Locate Installer
The installer will be created at:
```
dist/University Housing System Setup 1.0.0.exe
```

## Testing the Installer

1. Run the generated `.exe` file
2. Choose installation directory (default: `C:\Program Files\University Housing System`)
3. Verify desktop shortcut is created
4. Launch application and test:
   - Database initialization
   - User authentication
   - All CRUD operations
   - Printing functionality

## Production Considerations

### Database Persistence
- User data is stored in `%APPDATA%/University Housing Management/`
- Database persists across application updates
- Backups are stored in the same directory

### Security
- SQLite database is stored in user's AppData directory
- No sensitive data in installation directory
- Proper file permissions applied automatically

### Updates
- Application can be updated by running new installer
- Database and user data are preserved
- Configuration files maintained

## Troubleshooting

### Build Issues
```bash
# Clean build
rm -rf dist/
rm -rf out/
npm run build:win
```

### Database Issues
- Check database permissions in AppData directory
- Verify Prisma client generation
- Ensure migrations are included in build

### Icon Not Showing
- Verify `build/icon.ico` exists
- Check icon file format (should be 256x256 or higher)
- Rebuild after icon changes

## File Structure After Build
```
dist/
├── University Housing System Setup 1.0.0.exe
├── win-unpacked/
│   ├── University Housing System.exe
│   ├── resources/
│   │   ├── app.asar
│   │   └── prisma/
│   └── ... (other runtime files)
└── ... (build metadata)
```

## Final Verification Checklist

- [ ] Dependencies installed including react-to-print
- [ ] Prisma client generated
- [ ] Build completes without errors
- [ ] Installer creates desktop shortcut
- [ ] Application launches successfully
- [ ] Database initializes correctly
- [ ] All features work in production
- [ ] Printing functionality works
- [ ] User data persists across restarts

## Support

For build issues:
1. Check Node.js version compatibility
2. Verify all dependencies are installed
3. Ensure Prisma schema is valid
4. Check Windows permissions for installation directory

Your application is now ready for professional distribution! 🎉
