#!/bin/bash

# Script untuk menangani upload aset baru dan menyalinnya ke output standalone

echo "🚀 Memproses aset baru..."

# Pastikan direktori uploads ada
mkdir -p public/uploads
mkdir -p .next/standalone/public/uploads

# Salin semua aset dari public/uploads ke .next/standalone/public/uploads
echo "📂 Menyalin aset ke output standalone..."
cp -r public/uploads/* .next/standalone/public/uploads/ 2>/dev/null || true

# Periksa apakah PM2 sedang berjalan
if pm2 list | grep -q "oyagema"; then
  echo "🔄 Memperbarui aplikasi yang sedang berjalan..."
  # Opsional: Restart aplikasi jika diperlukan
  # pm2 reload oyagema
fi

echo "✅ Aset berhasil diproses dan disalin ke output standalone!"
echo "📁 Lokasi aset: .next/standalone/public/uploads/"