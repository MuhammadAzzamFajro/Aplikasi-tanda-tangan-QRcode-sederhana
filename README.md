# Aplikasi Tanda Tangan Digital QR Code Sederhana

Sebuah aplikasi web yang dirancang untuk memfasilitasi pembuatan dan pengelolaan tanda tangan digital. Proyek ini mengintegrasikan fungsionalitas tanda tangan berbasis kanvas dengan sistem otentikasi pengguna, serta memiliki potensi untuk memanfaatkan QR Code dalam alur kerja verifikasi atau identifikasi dokumen.

## Fitur Utama

*   **Otentikasi Pengguna Lengkap**: Alur pendaftaran (Sign Up), masuk (Login), dan keluar (Logout) pengguna yang aman.
*   **Canvas Tanda Tangan Interaktif**: Fitur untuk membuat tanda tangan digital langsung di browser menggunakan kanvas.
*   **Dashboard Pengguna**: Halaman khusus untuk pengguna yang terautentikasi untuk mengakses fitur-fitur aplikasi.
*   **API Pengguna**: Endpoint API RESTful untuk manajemen otentikasi (`/api/signup`, `/api/login`, `/api/logout`, `/api/me`).
*   **Antarmuka Pengguna Modern**: Desain UI yang responsif dan komponen yang dapat digunakan kembali, memastikan pengalaman pengguna yang baik.
*   **Integrasi QR Code**: Proyek ini dirancang dengan mempertimbangkan integrasi QR Code, kemungkinan untuk verifikasi tanda tangan, identifikasi dokumen, atau fungsi keamanan lainnya.

## Teknologi

Proyek ini dibangun menggunakan tumpukan teknologi modern berikut:

*   **Next.js**: Framework React full-stack untuk rendering sisi server (SSR), generasi situs statis (SSG), dan API Routes.
*   **TypeScript**: Bahasa pemrograman yang diketik secara statis untuk meningkatkan keandalan dan pemeliharaan kode.
*   **Supabase**: Backend-as-a-Service (BaaS) untuk otentikasi, database, dan fungsi backend lainnya.
*   **Tailwind CSS**: Framework CSS utility-first untuk styling yang cepat dan mudah dikustomisasi.
*   **Komponen UI**: Pemanfaatan sistem komponen UI yang terstruktur (menggunakan `components/ui` dan `components.json`, mengindikasikan pustaka seperti Shadcn UI).
*   **Canvas Tanda Tangan**: Implementasi fitur tanda tangan digital melalui komponen kanvas.

## Persyaratan

*   Node.js (v18 atau lebih tinggi)
*   npm atau Yarn
*   Akun dan Proyek Supabase

## Instalasi

Ikuti langkah-langkah di bawah ini untuk menyiapkan proyek secara lokal:

1.  **Clone repositori:**
    ```bash
    git clone https://github.com/your-username/Aplikasi-tanda-tangan-QRcode-sederhana.git
    cd Aplikasi-tanda-tangan-QRcode-sederhana
    ```

2.  **Instal dependensi:**
    ```bash
    npm install
    # atau
    yarn install
    ```

3.  **Konfigurasi Variabel Lingkungan:**
    Buat file `.env.local` di root proyek Anda dan tambahkan variabel lingkungan Supabase:
    ```
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```
    Pastikan Anda telah mengaktifkan metode otentikasi yang diperlukan (misalnya, email) di dashboard proyek Supabase Anda.

4.  **Jalankan aplikasi:**
    ```bash
    npm run dev
    # atau
    yarn dev
    ```
    Aplikasi akan berjalan di `http://localhost:3000`.

## Struktur Proyek

```
.
├── app/                  # Direktori utama Next.js (halaman, layout, API Routes)
│   ├── api/              # Endpoint API untuk otentikasi dan data
│   ├── dashboard/        # Halaman dashboard untuk pengguna terautentikasi
│   ├── login/            # Halaman login pengguna
│   ├── signup/           # Halaman pendaftaran pengguna
│   └── ...               # Halaman utama dan aset global
├── components/           # Komponen UI yang dapat digunakan kembali (formulir, signature canvas)
│   ├── ui/               # Komponen UI dasar (button, input, card, dll.)
│   └── ...
├── lib/                  # Utilitas dan konfigurasi (klien Supabase)
├── public/               # Aset statis (gambar, ikon)
├── package.json          # Metadata proyek dan daftar dependensi
├── tsconfig.json         # Konfigurasi TypeScript
├── next.config.ts        # Konfigurasi Next.js
└── ...                   # File konfigurasi lainnya (.gitignore, postcss.config.mjs, eslint.config.mjs)
```

## TODO

Untuk daftar fitur yang akan datang, perbaikan, dan tugas yang direncanakan, silakan lihat file [TODO.md](TODO.md).

## Kontribusi

Kontribusi disambut baik! Jika Anda memiliki saran, perbaikan, atau ingin melaporkan bug, silakan buat issue atau kirim pull request.

## Lisensi

Proyek ini dilisensikan di bawah lisensi MIT.
