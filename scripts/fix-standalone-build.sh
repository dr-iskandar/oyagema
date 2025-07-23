#!/bin/bash

# Script untuk memperbaiki masalah standalone build yang hilang

echo "🔧 Memperbaiki masalah standalone build..."

# Hapus build lama jika ada
echo "🗑️ Menghapus build lama..."
rm -rf .next

# Install dependencies
echo "📦 Memastikan dependencies terinstall..."
npm ci

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Build ulang aplikasi
echo "🏗️ Building aplikasi dengan standalone output..."
npm run build

# Verifikasi apakah server.js ada
if [ -f ".next/standalone/server.js" ]; then
    echo "✅ File server.js berhasil dibuat!"
    echo "📁 Lokasi: .next/standalone/server.js"
else
    echo "❌ File server.js tidak ditemukan!"
    echo "🔍 Memeriksa struktur direktori .next..."
    ls -la .next/
    if [ -d ".next/standalone" ]; then
        echo "📁 Isi direktori .next/standalone:"
        ls -la .next/standalone/
    else
        echo "❌ Direktori .next/standalone tidak ada!"
    fi
    exit 1
fi

# Copy public folder
echo "📂 Menyalin folder public ke standalone..."
cp -r public .next/standalone/

# Pastikan direktori uploads ada
echo "📂 Memastikan direktori uploads ada..."
mkdir -p .next/standalone/public/uploads

# Copy uploads jika ada
if [ -d "public/uploads" ] && [ "$(ls -A public/uploads 2>/dev/null)" ]; then
    echo "📂 Menyalin file uploads yang ada..."
    cp -r public/uploads/* .next/standalone/public/uploads/ 2>/dev/null || true
fi

# Copy static assets jika ada
if [ -d ".next/static" ]; then
    echo "📂 Menyalin static assets..."
    mkdir -p .next/standalone/.next/static
    cp -r .next/static/* .next/standalone/.next/static/ 2>/dev/null || true
fi

echo "✅ Standalone build berhasil diperbaiki!"
echo "🚀 Sekarang Anda dapat menjalankan: pm2 restart oyagema"
echo "📊 Monitor dengan: pm2 logs oyagema"