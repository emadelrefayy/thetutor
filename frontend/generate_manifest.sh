#!/bin/bash
OUTPUT="PROJECT_MANIFEST.txt"

echo "==========================================" > $OUTPUT
echo "       THE TUTOR - SYSTEM & PROJECT MANIFEST" >> $OUTPUT
echo "       Generated: $(date)" >> $OUTPUT
echo "==========================================" >> $OUTPUT
echo "" >> $OUTPUT

echo "--- 1. SYSTEM & NODE ENVIRONMENT ---" >> $OUTPUT
echo "OS / Kernel: $(uname -a)" >> $OUTPUT
echo "Node Path: $(which node)" >> $OUTPUT
echo "Node Version: $(node -v)" >> $OUTPUT
echo "NPM Path: $(which npm)" >> $OUTPUT
echo "NPM Version: $(npm -v)" >> $OUTPUT
echo "" >> $OUTPUT

echo "--- 2. PACKAGE.JSON DEPENDENCIES ---" >> $OUTPUT
if [ -f "package.json" ]; then
  cat package.json >> $OUTPUT
else
  echo "package.json not found!" >> $OUTPUT
fi
echo "" >> $OUTPUT

echo "--- 3. VITE CONFIGURATION ---" >> $OUTPUT
if [ -f "vite.config.ts" ]; then
  cat vite.config.ts >> $OUTPUT
elif [ -f "vite.config.js" ]; then
  cat vite.config.js >> $OUTPUT
fi
echo "" >> $OUTPUT

echo "--- 4. POSTCSS & TAILWIND CONFIG ---" >> $OUTPUT
if [ -f "postcss.config.js" ]; then
  echo "=== postcss.config.js ===" >> $OUTPUT
  cat postcss.config.js >> $OUTPUT
fi
if [ -f "tailwind.config.js" ]; then
  echo "=== tailwind.config.js ===" >> $OUTPUT
  cat tailwind.config.js >> $OUTPUT
fi
echo "" >> $OUTPUT

echo "--- 5. ENVIRONMENT VARIABLES (.env) ---" >> $OUTPUT
if [ -f ".env" ]; then
  cat .env >> $OUTPUT
fi
echo "" >> $OUTPUT

echo "--- 6. PROJECT DIRECTORY STRUCTURE (src/) ---" >> $OUTPUT
find src -type f | sort >> $OUTPUT
echo "" >> $OUTPUT

echo "--- 7. INSTALLED PACKAGES (npm list --depth=0) ---" >> $OUTPUT
npm list --depth=0 >> $OUTPUT 2>&1

echo "==========================================" >> $OUTPUT
echo "Manifest successfully saved to $OUTPUT"
