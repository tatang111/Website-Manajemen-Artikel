📝 Website Manajemen Artikel 
Website ini merupakan platform manajemen artikel untuk kebutuhan admin dan pengguna, dibangun menggunakan Next.js, React, TanStack Query, Shadcn UI, Zod + React Hook Form, dan Tailwind CSS, serta terhubung ke backend API untuk operasi CRUD data artikel dan kategori.

## 🚀 Live Demo
🔗 [Lihat di Vercel](https://chill-cinema-fe3-showcases.vercel.app/)

🚀 Fitur Utama
 - Sistem login/registrasi pengguna biasa / admin
 - melihat semua article
 - Filtering article menggunakan kategory dan search yang disimpan di url
 - Pagination
 - Autentikasi admin
 - Filter kategori berdasarkan status
 - Manajemen kategori (tambah, edit, hapus)
 - Manajemen artikel (tambah, edit hapus)
 - Pencarian kategori & artikel
 - Notifikasi via toast (success/error)
 - UI modern dan responsif (menggunakan Tailwind & Shadcn UI)
 - Upload gambar thumbnail artikel
 - redirect ketika belum login

🧱 Tech Stack
 - Frontend: Next.js 14, React, Tailwind CSS, Shadcn UI, Lucide Icons
 - Fetching Api: TanStack Query
 - Form Validation: Zod + React Hook Form
 - HTTP Client: Axios
 - Other library: Day.js, jwt-decode, lodash
 - Version Control: Git dan GitHub

🏗️ Struktur Folder
 - ├── app/                        # Halaman utama & page
 - │   ├── page.tsx
 - |    |-- ...
 - ├── components/                # Komponen UI 
 - │   ├── CategoryAdmin.tsx
 - │   ├── NavbarAdmin.tsx
 - │   └── ...
 - ├── lib/                       # Utils dan konfigurasi (axios, hooks)
 - │   ├── axios.ts
 - │   └── useDebounce.ts
 - ├── public/                    # File statis
 - ├── styles/                    # Styling global 
 - ├── README.md
 - env.local => NEXT_PUBLIC_API_URL =https://test-fe.mysellerpintar.com/api

⚙️ Fitur Admin
 - Login sebagai admin
 - Tambah/Edit/Hapus kategori
 - Tambah/Edit/Hapus artikel
 - Dialog konfirmasi sebelum hapus
 - Pagination otomatis (berbasis total data)
 - Search (dengan debounce)

📚 Catatan 
 - Menggunakan React Query (TanStack) untuk fetching & caching data.
 - Pagination dikendalikan via URL query (?page=...) dan useSearchParams.
 - Dialog dikendalikan menggunakan @radix-ui/react-dialog (via shadcn/ui).
 - Komponen modular dan reusable.
