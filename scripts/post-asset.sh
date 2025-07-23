#!/bin/bash

# Script untuk menangani upload aset baru dan menyalinnya ke output standalone

echo "🚀 Memproses aset baru..."

# Pastikan direktori uploads ada
mkdir -p public/uploads
mkdir -p .next/standalone/public/uploads
mkdir -p .next/standalone/.next/static

# Salin semua aset dari public/uploads ke .next/standalone/public/uploads
echo "📂 Menyalin aset ke output standalone..."
cp -r public/uploads/* .next/standalone/public/uploads/ 2>/dev/null || true

# Salin folder public ke standalone
echo "📂 Menyalin folder public ke output standalone..."
cp -r public/* .next/standalone/public/ 2>/dev/null || true

# Salin folder static ke standalone
echo "📂 Menyalin folder static ke output standalone..."
cp -r .next/static/* .next/standalone/.next/static/ 2>/dev/null || true

# Periksa apakah PM2 sedang berjalan
if pm2 list | grep -q "oyagema"; then
  echo "🔄 Memperbarui aplikasi yang sedang berjalan..."
  # Opsional: Restart aplikasi jika diperlukan
  # pm2 reload oyagema
fi

echo "✅ Aset berhasil diproses dan disalin ke output standalone!"
echo "📁 Lokasi aset: .next/standalone/public/"
echo "📁 Lokasi static: .next/standalone/.next/static/"