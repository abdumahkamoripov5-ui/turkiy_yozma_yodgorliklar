# Turkiy Meros — ishlaydigan mahalliy MVP

## Ochish

Loyiha papkasidagi `MVPni_ochish.cmd` faylini ikki marta bosing. Dastur baza yangilanishlarini bajaradi, yetishmayotgan namunalarni qo‘shadi va brauzerda `http://127.0.0.1:8000/app/` manzilini ochadi. Server oynasi ishlayotgan paytda sayt ochiq bo‘ladi. To‘xtatish: Ctrl+C.

Loyihaning `.venv` muhitidan foydalaniladi. Python 3.14 bilan admin panel ishlashi uchun Django 5.2.18 o‘rnatildi; tizimdagi boshqa loyihalarning Django versiyasi o‘zgartirilmadi. Yangi muhit yaratishda `python -m venv .venv` va `.venv\Scripts\python.exe -m pip install -r backend/requirements.txt` ishlatiladi.

Administrator: `http://127.0.0.1:8000/django-admin/`. Birinchi mahalliy ishga tushirishda faol superadmin bo‘lmasa, tasodifiy parolli akkaunt yaratiladi. Kirish ma’lumotlari `.local/MVP_admin_kirish.txt` faylida; bu fayl Gitga qo‘shilmaydi. Mavjud administrator paroli almashtirilmaydi.

## MVPda ishlaydigan imkoniyatlar

- Yangi bosh sahifa va o‘zbekcha asosiy yo‘nalishlar: korpus, kitobxona, bolalar/o‘smirlar, so‘zlar, ovoz, ilmiy hamkorlik.
- Mavjud korpus: katalog, filtrlar, qidiruv, asl yozuv, transliteratsiya, tarjima, tadqiqotchilar, bibliografiya va iqtibos; xarita, vaqt chizig‘i, taqqoslash va kontekstli qidiruv.
- Elektron kitoblar: muqova, varaqlash, mundarija, shrift o‘lchami, qulay o‘qish rejimi, kitob ichidan qidirish, shaxsiy qayd va davom ettirish.
- Yosh bo‘yicha darslar: 7–12 va 12–18; bog‘langan lug‘at so‘zlari va javobi serverda tekshiriladigan topshiriq.
- Admin yuklagan MP4/WebM uchun sayt ichidagi HTML video pleyer va ko‘rish joyini davom ettirish.
- Ro‘yxatdan o‘tish va kirish. Saytdagi ovoz berish: bir akkauntdan bitta ovoz, haqiqiy sonlar, kampaniya muddati va natijalar.
- Admin orqali muddati tugagan kampaniya g‘olibini lug‘atga qo‘shish. Tenglik yoki nol ovoz bo‘lsa g‘olib chiqarilmaydi.
- Maqola, kitob, dissertatsiya, yodgorlik matni yoki video dars havolasini yuborish. PDF 20 MBgacha. Ishlar admin tasdig‘idan keyin ommaga ochiladi; muallif o‘z ishining holatini ko‘radi.
- Lug‘at, saqlanganlar va admin boshqaradigan tashqi manba havolalari.

## Adminning asosiy ishlari

**Kitob:** “Elektron kitoblar”da yozuv yarating. Sahifalar JSON shaklida beriladi:

```json
[
  {"title": "Birinchi bob", "text": "Birinchi xatboshi.\n\nIkkinchi xatboshi."},
  {"title": "Ikkinchi bob", "text": "Davomi…"}
]
```

Nashr qilingan belgisini qo‘ying. Skan/PDFni avtomatik sahifali matnga aylantirish MVPga kirmaydi.

**Video:** “Video darslar”da yosh guruhi, serial, qism, tavsif, video fayli va matnni kiriting. Bog‘liq so‘zlarni tanlang. Nashr qiling. Brauzerda qo‘llanadigan kodekdagi MP4 yoki WebM kerak; MVP avtomatik video konvertatsiya qilmaydi.

Topshiriq formati:

```json
{"question": "Savol?", "options": ["Birinchi", "Ikkinchi"], "answer": 0, "explanation": "Izoh"}
```

`answer` indeksi 0 dan boshlanadi. To‘g‘ri javob ochiq dars API javobiga qo‘shilmaydi; foydalanuvchi javob yuborganda server tekshiradi.

**Ovoz:** “So‘z kampaniyalari”da kampaniya va variantlar yarating. Muddati tugaganda kampaniyani belgilang va “Yakunlangan kampaniya g‘olibini lug‘atga qo‘shish” amalini bajaring. Ovoz boshlanganidan keyin variantlar admin interfeysida o‘zgartirilmaydi.

**Ilmiy ish:** “Ilmiy ishlar”da PDFni ko‘rib, holatini “Nashr qilingan” yoki “Rad etilgan” qiling; muallifga izoh yozing. Nashrdan oldingi fayllar public media manzilida saqlanmaydi. Ularni faqat muallif yoki admin oladi. Ishchi hostingda `backend/private_uploads/` uchun doimiy, ommaga berilmaydigan xotira va zaxira kerak.

## Materiallar va MVP chegaralari

17 yodgorlik mavjud demoning boshlang‘ich ma’lumotlaridan olindi. Ularning asl yozuvlari, tarjimalari, tasvir huquqlari va metama’lumotlari ishchi ilmiy korpus uchun mutaxassis tomonidan tekshirilishi kerak. Statistik so‘z/qator sonlari demoning metama’lumotlari bo‘lib, yuklangan qisqa parchalarni avtomatik sanash natijasi emas.

Uchta qisqa kitob va ikkita matnli dars platforma uchun yozilgan o‘quv namunalari. Ular asl tarixiy kitob, tayyor multfilm yoki anime deb ko‘rsatilmagan. Kampaniya ham namuna deb belgilangan. Tayyor video berilmaganligi sababli video fayllari hozircha bo‘sh; admin orqali siz tayyorlagan materiallar yuklanadi.

Saqlanganlar, kitob/video davom ettirish va qaydlar shu brauzerda saqlanadi; qurilmalar yoki akkauntlar orasida sinxronlashmaydi. Brauzer ma’lumotlari tozalansa ular o‘chadi. Ilmiy ishlar, ovozlar va kontent esa server bazasida saqlanadi.

Hozircha ulanmagan: Telegram/Instagram/Facebook/X/TikTok/YouTube ichki ovozlarini yig‘ish, tashqi API importlari, ko‘p tilli yangi kontent tarjimasi, HLS/video transkodlash, OCR, kengaytirilgan shaxsiy profil va institut sahifalari, obuna/xabarnomalar, o‘qituvchi dars konstruktori. Ular to‘liq texnik topshiriqning keyingi kengaytmalaridir. “Tashqi manbalar” hozircha qo‘lda boshqariladigan havolalar katalogidir.

Bu mahalliy MVP; 100 ming oylik tashrif uchun tayyor hosting quvvati yoki yuklama kafolati emas. Ishchi hostingga chiqarishda PostgreSQL, doimiy media va private xotira, HTTPS, zaxiralash va real yuklama/video sarfi asosidagi konfiguratsiya kerak.

Ishchi hostingda video uchun `AWS_STORAGE_BUCKET_NAME` yoki doimiy diskdagi `MEDIA_ROOT`, ilmiy PDF uchun alohida yopiq `PRIVATE_AWS_STORAGE_BUCKET_NAME` yoki doimiy diskdagi `PRIVATE_UPLOADS_ROOT` sozlanadi. Yopiq bucketda public access o‘chirilgan bo‘lishi kerak; ochiq rasm/video bucketi bilan bir xil bucket ishlatmang. Doimiy xotira sozlanmasa, yangi video va ilmiy PDF yuklash rad etiladi; ilmiy ishni havola/matn bilan yuborish ishlaydi. `.env.example`da namuna mavjud. Deploy holati: `/api/v2/health/` joriy Render commitini qaytaradi.

## Tekshirish

Backend:

```powershell
cd backend
$env:DJANGO_DEBUG='True'
..\.venv\Scripts\python.exe manage.py test korpus --noinput
..\.venv\Scripts\python.exe manage.py check
```

Frontend:

```powershell
cd frontend
$env:VITE_BASE='/app/'
npm.cmd run build
npm.cmd test
```

Brauzer tekshiruvi: alohida Chrome debugging sessiyasi 9222 portda va MVP 8000 portda ochiq bo‘lganda `node frontend/tests/mvp-browser.mjs`. Tekshiruv vaqtinchalik foydalanuvchi, ovoz va ilmiy ish yaratadi; foydalanuvchi nomi `.local/mvp-qa-report.json`da yoziladi. Faqat shu foydalanuvchini olib tashlash uning sinov yozuvlarini ham tozalaydi. Skrinshotlar `.local/` ichida.

Yangi muhitda Python bog‘liqliklari `backend/requirements.txt`, frontend bog‘liqliklari `frontend/package-lock.json` orqali o‘rnatiladi. Windowsda npm PowerShell cheklovi bo‘lsa `npm.cmd` ishlating. `seed_mvp` takror ishga tushirilganda mavjud material tahrirlarini almashtirmaydi.
