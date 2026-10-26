# Kirish tartibi va auditoriya hisobotlari

## Foydalanuvchi oqimi

Bosh sahifada bitiktosh animatsiyasi va bepul hisob ochishga yo‘naltirish ko‘rinadi. Mehmon menyusida “Merosni kashf eting” yoki “Lug‘at” yo‘q. Yodgorliklar, lug‘at, izlanish vositalari va boshqa funksiyalar hisob ochib kirgandan so‘ng ochiladi. To‘g‘ridan-to‘g‘ri havola ro‘yxatdan o‘tish sahifasiga yo‘naltiradi; kirgandan keyin foydalanuvchi dastlab so‘ragan manziliga qaytadi. Himoyalangan API ham mehmon so‘rovlariga 401 qaytaradi.

## Admin statistikasi

Admin bosh sahifasida va **Statistika va hisobotlar** bo‘limida mavjud. Manzil: `/django-admin/korpus/useractivity/report/`. Superadmin yoki `korpus.view_useractivity` huquqi bor xodim ko‘ra oladi.

- **Bugun**, **oxirgi 7 kun**, **oxirgi 30 kun** — joriy kunni ham o‘z ichiga oladi, loyiha vaqt mintaqasi bo‘yicha.
- **Noyob brauzerlar** — imzolangan tasodifiy cookie bo‘yicha taxminiy tashrifchilar. Bu aniq odamlar soni emas: bir odam bir nechta brauzer/qurilmada qayta sanalishi mumkin.
- **Tashriflar** — 30 daqiqa faoliyatsizlikdan keyin yangi sessiya.
- **Sahifa ochilishlari** — SPA navigatsiyasi, bir hodisa ID’si takror yuborilsa qayta sanalmaydi.
- **Faol hisoblar** — tanlangan davrda sahifa ochgan noyob hisoblar.
- **Kirishlar / yangi hisoblar** — mavjud kirish tarixi va foydalanuvchi jadvallaridan.
- **Eng ko‘p ochilgan funksiyalar** — sahifa ochish, brauzer va hisoblar kesimida.
- **Bajarilgan amallar** — muvaffaqiyatli konkordans, aniq lug‘at qidiruvi, eksport, ovoz va taklif yuborish API murojaatlari. Bular sahifa ko‘rishlardan alohida.

Admin hisoblarining tashriflari hamda odatiy bot/crawler so‘rovlari chiqarib tashlanadi. Grafik va batafsil kunlik jadval tanlangan davrga moslashadi. Natijalar 60 soniyagacha keshlanadi. Oldingi anonim tashriflar uydirib tiklanmaydi: hisobotda qayd boshlanish sanasi ko‘rsatiladi. Sayt tashriflari yangi deploydan keyin yig‘ila boshlaydi; mavjud kirish/API tarixi avvalgi ma’lumotlardan foydalanadi.

Tashrif hodisasi faqat oldindan belgilangan bo‘lim nomi va tasodifiy ID’ni yuboradi. Qidiruv matni, URL parametrlari, forma qiymatlari, IP yoki qurilma barmoq izi yangi tashrif jadvallariga yozilmaydi. Statistikani yuborish o‘qish va navigatsiyani to‘smasdan, bo‘sh vaqtda bajariladi.

## Animatsiya unumdorligi

Yoritilgan tosh tasvirlari oldindan hisoblangan WebP fayllaridan olinadi. Scroll paytida WebGL, shader yoki uzluksiz 3D chizish ishlamaydi. Mos brauzerlarda CSS scroll timeline, boshqalarida talab bo‘yicha transform ishlaydi. Kuchsiz qurilmada ikkilamchi dekoratsiya kamayadi, `prefers-reduced-motion` uchun statik o‘qiladigan ko‘rinish bor.

Mahalliy kompyuter va 390px / 2x mobil o‘lchamidagi 5.5 soniyalik scroll sinovlarida 50ms dan uzun kadrlar 0 ta kuzatildi. Bu barcha qurilmalar uchun universal kafolat emas; 4x protsessor sekinlashtirilgan stress sinovida ayrim uzun kadrlar saqlanishi mumkin. Takrorlash: `node frontend/tests/stone-performance.mjs`; `STONE_WIDTH`, `STONE_CPU_RATE`, `STONE_PERF_REPORT` parametrlarini muhit orqali berish mumkin.

## Joylashtirish

`0013_sitevisit_pageview` migratsiyasi yangi ikki jadvalni yaratadi. Production deploy `--build-env VERCEL_RUN_MIGRATIONS=1` bilan bajariladi. Bu deploy mavjud lug‘at/yodgorliklarni almashtirmaydi.
