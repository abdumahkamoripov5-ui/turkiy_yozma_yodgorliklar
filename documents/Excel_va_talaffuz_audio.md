# Excel orqali so‘z yuklash va talaffuz audiosi

Admin panel: `/django-admin/korpus/wordentry/`.

## Excel import

1. **Excel orqali yuklash** tugmasini bosing va namuna `.xlsx` faylini yuklab oling.
2. Birinchi varaqdagi ustunlarni saqlang: `word` (so‘z), `meaning` (ma’no), `source` (manba) majburiy. `pronunciation`, `example`, `status` va tillar ustunlari ixtiyoriy.
3. `status` qiymati `historical` yoki `community`; bo‘sh bo‘lsa `historical`. `uz`, `tr`, `kk` kabi ustunlarga muqobil so‘zlarni kiriting.
4. Faylni tanlab **Tekshirish va ko‘rib chiqish**ni bosing. Xato bo‘lsa, qator raqami ko‘rsatiladi va hech narsa saqlanmaydi.
5. Ro‘yxatni ko‘rib **Tasdiqlash va qoralama saqlash**ni bosing. Tasdiqlash muddati 30 daqiqa.
6. Qoralamalarni tekshirib, odatdagi tahrirlash sahifasida nashr qiling.

Bir faylda 1000 qator, 5 MB fayl va jami 200 000 matn belgisi chegarasi bor. Formulalar qabul qilinmaydi. So‘z va manbasi bir xil bo‘lgan yozuvlar, shu jumladan fayl ichidagi takrorlar o‘tkaziladi. Mavjud so‘zlar o‘zgarmaydi. Boshqa manbadagi bir xil so‘zni alohida kiritish mumkin. Faqat so‘z qo‘shish huquqi bor admin import qila oladi.

## Talaffuz audiosi

1. So‘zni tahrirlash sahifasida **Talaffuz audiosi** bo‘limini oching.
2. MP3, WAV yoki OGG faylni yuklang (10 MB gacha).
3. Inson yoki AI ovozi ekanini tanlang. Ovoz muallifi yoki xizmat nomini va foydalanish huquqini yozing.
4. Saqlang. Yangi audio hali tasdiqlanmagan bo‘ladi.
5. Qayta ochib audioni tinglang, talaffuzini tekshiring. **Talaffuz audiosi tekshirildi**ni belgilang va saqlang.
6. Nashr qilingan so‘z sahifasida audio pleyer chiqadi. Tasdiqsiz yuklangan audio API javobiga kiritilmaydi. Fayl manzili maxfiy saqlash vositasi emas: media fayllar ommaviy xotirada turadi.

Loyihaning dastlabki **bilim**, **bitik**, **el** o‘quv namunalarida statik AI sinov audiosi ham mavjud. Ular foydalanuvchi so‘rovi bilan ommaga chiqarilgan va “AI yaratgan sinov audiosi; tarixiy talaffuz mutaxassis tomonidan tekshirilmagan” deb belgilanadi. Bu yozuvlar audio yoki so‘zning ekspert tasdig‘ini o‘zgartirmaydi. Faqat dastlabki o‘quv manbasi va bo‘sh talaffuz maydoni mos kelsa ishlaydi; tasdiqlangan yangi audio undan ustun turadi. Sinov MP3 fayllari `backend/korpus/static/korpus/audio/demo/`da saqlanadi, shu bois Vercel’ning vaqtinchalik media diskiga bog‘liq emas.

Audio, so‘z, talaffuz yoki ovozga oid ma’lumot o‘zgarsa, audio tasdig‘i bekor qilinadi. Uni qayta tinglab tasdiqlash kerak.

## Audioni qayerdan olish mumkin?

Tilshunosning roziligi bilan uning ovozini yozish yoki foydalanish huquqi bor tayyor yozuvni olish mumkin. AI yaratgan yozuv ham yuklanadi. Microsoft Azure Speech o‘zbekcha `uz-UZ-MadinaNeural` va `uz-UZ-SardorNeural` ovozlarini taklif qiladi:
https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support

Hozirgi o‘zbekcha ovoz tarixiy turkiy talaffuzning to‘g‘riligini kafolatlamaydi. AI audioni tilshunos tekshirishi kerak. Loyihaga pulli TTS API yoki avtomatik audio yaratish ulanmagan.

## Hostingga chiqarish

Bog‘liqliklarni o‘rnating: `pip install -r requirements.txt`. Migratsiya: `python manage.py migrate`. Frontendni hostingga mos `VITE_BASE` bilan qayta yig‘ing. Audio saqlanishi uchun S3/R2 xotirasi yoki doimiy diskdagi `MEDIA_ROOT` sozlangan bo‘lishi kerak; vaqtinchalik diskka production audio yuklash rad etiladi. S3/R2 media manzili brauzerda ochiladigan qilib sozlanadi.

Vercel’da migratsiyani shu deploy vaqtida bajarish uchun `vercel deploy --prod --build-env VERCEL_RUN_MIGRATIONS=1` ishlatiladi. Flag bo‘lmasa build bazani o‘zgartirmaydi. Flag faqat migratsiyalarni bajaradi, ma’lumot yoki foydalanuvchi yaratmaydi.
