#!/bin/bash
echo "📦 1. جاري بناء التطبيق (npm run build)..."
npm run build
echo "🔄 2. إيقاف أي سيرفر قديم..."
pkill -f "python3 server.py" 2>/dev/null
echo "🚀 3. تشغيل سيرفر SPA المحدث..."
python3 server.py
