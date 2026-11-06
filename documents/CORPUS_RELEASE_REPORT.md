> Yangilanish: kontentning joriy holati [SCHOLARLY_CONTENT_RELEASE.md](SCHOLARLY_CONTENT_RELEASE.md) hujjatida. Quyidagi 17/7/3 raqamlari manbali kontent importidan oldingi auditga tegishli.

# Turkiy Meros — joriy yangilanish

Rasmiy mavzu: VII–VIII asrlardagi turkiy yozma yodgorliklar. Qisqa brend: Turkiy Meros.

## Amalga oshirilgan ishlar

Bosh sahifa ilmiy korpusga mos ravishda qayta tuzildi. Qidiruv, katalog, lug‘at, xarita va tadqiqot vositalari uchun mehmonlarga ham ko‘rinadigan navigatsiya yaratildi. Mobil menyu, UZ/RU/EN interfeys, qorong‘i rejim, klaviatura fokusi, asosiy mazmunga o‘tish havolasi va xatoni tutuvchi sahifa qo‘shildi.

Lug‘at qayta ishlanib, qidiruv va ekspert tekshiruvi filtri URL bilan sinxronlashtirildi. Kirish/ro‘yxatdan o‘tishdan keyin foydalanuvchi so‘ragan ichki sahifaga qaytadi. Asosiy korpus uchun API so‘rovlariga `scope=core` qo‘shildi: katalog, qidiruv, statistika, eksport va satr misollari bir xil davr doirasidan foydalanadi. Mutaxassislar uchun bazadagi boshqa davr yozuvlari o‘chirilmagan.

`/guide` — foydalanish va ilmiy tamoyillar. `/quality` — bazadan hisoblanadigan ma’lumot sifati hisoboti. Yodgorlik kartasi va o‘qish oynasi tahririy satrlar mavjudligini aniq ko‘rsatadi. Bibliografiya mavjudligi ekspert tasdig‘i sifatida talqin qilinmaydi.

Tarixiy kontekst va foto kreditlari TDV İslâm Ansiklopedisi, UNESCO va Wikimedia Commons manbalariga bog‘langan. Yangi tashqi manbalar mavjud yozuvlarni almashtirmasdan qo‘shildi.

## Haqiqiy kontent holati

Tekshiruv vaqtidagi bazada 17 ta yodgorlik yozuvi mavjud. Ulardan 7 tasining butun berilgan sanasi 601–800 oralig‘ida. Qolgan 10 ta yozuv boshqa davrga tegishli yoki sanasi asosiy davrdan kengroq.

Hozirgi 3 ta lug‘at yozuvi o‘quv namunalari; ekspert tekshiruvchisi va sanasi bilan tasdiqlangan maqolalar soni 0. Tahririy nashr qilingan parallel satrlar soni ham 0. Mavjud newline asosidagi moslik dastlabki/avtomatik deb ko‘rsatiladi.

Shuning uchun interfeys va dasturiy jarayonlar tekshirilgan bo‘lsa-da, ilmiy ma’lumotlar ommaviy ilmiy nashr darajasiga tayyor deb e’lon qilinmagan. Filolog har bir satr uchun nashr, sahifa, satr belgisi, asl yozuv, transliteratsiya, tarjima va foydalanish huquqlarini tekshirishi kerak. Aniq sanasiz davr guruhlarini alohida yodgorlik sifatida aniq yilga majburan kiritish kerak emas.

## Ma’lumotlarni tekshirish va to‘ldirish

PowerShell, loyiha ildizida:

```powershell
$env:DJANGO_DEBUG='True'
.\.venv\Scripts\python.exe backend/manage.py audit_corpus --json
.\.venv\Scripts\python.exe backend/manage.py seed_reference_sources
```

Parallel matn uchun `documents/parallel-lines-template.csv` shablonidan foydalaning. UTF-8 CSV ustunlari: `monument_id,position,label,original,transliteration,translation,source`. `source` maydonida aniq ilmiy nashr va sahifa bo‘lishi kerak. Barcha ustunlar majburiy.

```powershell
.\.venv\Scripts\python.exe backend/manage.py import_corpus_lines path/to/lines.csv
.\.venv\Scripts\python.exe backend/manage.py import_corpus_lines path/to/lines.csv --apply
```

Birinchi buyruq faqat tekshiradi. `--apply` yangi satrlarni QORALAMA holatda yaratadi; mavjud satrlar almashtirilmaydi. Bir satrdagi xato butun importni to‘xtatadi. Mutaxassis Django admin orqali tekshirib, nashr qiladi. Import hech qanday satrni avtomatik ravishda tasdiqlamaydi.

## Ishga tushirish

Backend:

```powershell
$env:DJANGO_DEBUG='True'
$env:FRONTEND_URL='http://127.0.0.1:5173/'
.\.venv\Scripts\python.exe backend/manage.py runserver 127.0.0.1:8000 --noreload
```

Frontend, boshqa terminalda:

```powershell
cd frontend
npm.cmd run dev -- --host 127.0.0.1
```

Manzil: http://127.0.0.1:5173/

Hisob talab qiladigan avvalgi kirish siyosati saqlangan. Chop etilgan matnlarni mehmonlarga to‘liq ochish bo‘yicha foydalanuvchiga yuborilgan tanlov hali javobsiz. Bosh sahifa va qo‘llanma ommaviy.

## Tekshiruvlar

Backend testlari, frontend API testlari, production build va npm audit bajariladi. `frontend/tests/corpus-browser.mjs` bosh sahifa, tillar, menyu, filtrlar, tungi rejim va mobil o‘lchamni tekshiradi. `frontend/tests/corpus-workflow-browser.mjs` ro‘yxatdan o‘tish, qaytish havolasi, haqiqiy qidiruv, eksport, parallel o‘qish, lug‘at filtri, sifat hisoboti va asosiy sahifalarni tekshiradi. Brauzer testlari lokal Chrome DevTools porti 9222 orqali ishlaydi; sinov hisoblarini haqiqiy hisoblar bilan aralashtirmang.

Tekshiruv artefaktlari `.local/corpus-*.png`, `.local/corpus-browser-report.json`, `.local/corpus-workflow-report.json` va `.local/corpus-data-audit.json` ichida saqlanadi.

Vite 6.4.5 va follow-redirects 1.16.2 tuzatishlari o‘rnatildi; tekshiruv vaqtidagi npm audit natijasi: 0 ta zaiflik. Lucide React belgilar kutubxonasi qo‘shildi. O‘zgarishlar lokal loyihada; Vercel/Render joylashtiruvi bu ish davomida o‘zgartirilmadi.
