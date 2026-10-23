# Parallel o‘qish — birinchi bosqich

Yodgorlik kartasi ochilganda **Parallel o‘qish** oynasi ko‘rinadi. Asl yozuv,
transliteratsiya va tarjima yonma-yon, telefonda esa ketma-ket ko‘rsatiladi.
Satr tugmasi uning uchta matnini birgalikda ajratadi. Transliteratsiya yoki
tarjimadagi so‘z bosilsa, nashr qilingan lug‘atdagi aynan shu so‘zning izohi,
misoli va manbasi ochiladi. Lug‘atda mavjud bo‘lmagan shakl uchun bu holat ochiq
ko‘rsatiladi; avtomatik morfologik tahlil yoki tarjima yaratilmaydi.

## Matnning ilmiy maqomi

- **Avtomatik moslik:** uchala matnda qatorlar soni teng bo‘lsa, ular yangi qatorlar
  bo‘yicha juftlanadi. Bu ilmiy tekshiruvdan o‘tmagan moslik sifatida belgilanadi.
  Ko‘rsatilgan tartib raqamlari asl yodgorlikdagi satr raqamlari emas.
- **Moslik yo‘q:** qatorlar soni farq qilsa yoki matn ustunlaridan biri yo‘q bo‘lsa,
  matnlar to‘liq alohida ko‘rsatiladi; majburiy juftlash bajarilmaydi.
- **Muharrir tasdiqlagan satrlar:** admin kiritgan va nashr qilgan satrlar
  avtomatik moslik o‘rniga ko‘rsatiladi. Qoralama satrlar ommaga chiqarilmaydi.
  To‘liq matnlar oldingi Matn / Transliteratsiya / Tarjima bo‘limlarida qoladi.

## Muharrir uchun

Admin → Yodgorliklar → kerakli yodgorlik → **Parallel satrlar** → qo‘shish.
Tartib, asl nashrdagi satr belgisi (masalan, E 1), mavjud matnlar va aniq nashr /
sahifani kiriting. Tekshirilgach **Tekshirilgan va nashr qilingan** belgisini yoqing.
Manbasiz yoki butunlay bo‘sh satrni nashr qilishga forma ruxsat bermaydi.
Lug‘at izohlarini adminning **Lug‘at so‘zlari** bo‘limida manbasi bilan kiriting.

## Ishga tushirish va tekshirish

Yangi bazada ham, mavjud bazada ham kodni ishga tushirishdan oldin:
`python backend/manage.py migrate --noinput`.
Production bazasiga `0010_monumentline` migratsiyasi kod chiqarilishidan oldin
qo‘llanishi kerak. Oddiy Vercel build migratsiyani avtomatik bajarmaydi.

Backend: `python backend/manage.py test korpus.test_reading`.
Brauzer: alohida Chrome debugging profili va lokal server bilan
`node frontend/tests/reading-browser.mjs`.
`READING_TEST_URL` standartda `http://127.0.0.1:8002/app/`, `CHROME_DEBUG_URL`
esa `http://127.0.0.1:9333`. Brauzer testi vaqtinchalik ma’lumot yaratib o‘chiradi;
faqat localhost manzillarini qabul qiladi. O‘zbek, rus, ingliz va turk tillari,
360 px ko‘rinish, lug‘at izohi hamda qoralama satrlarning yashirilishi tekshiriladi.
