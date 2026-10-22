# Turkiy Meros — MVP tavsifi

Ishlaydigan dastlabki versiyaning maqsadi, sahifalari va foydalanish tartibi.

Sana: 22.10.2026. Holat: mavjud demo va buyurtmachining tavsiflari asosida tayyorlangan mahalliy MVP.

## 1. MVP nimani anglatadi?

MVP — loyiha g‘oyasini amalda ko‘rsatadigan, eng muhim funksiyalari ishlaydigan dastlabki versiya. Ushbu MVP foydalanuvchiga turkiy yozma merosni ko‘rish, kitob o‘qish, yoshga mos darslardan foydalanish, so‘zga ovoz berish va ilmiy ish yuborish imkonini beradi.

Bu hujjat tayyorlangan MVPni tushuntiradi. Birja uchun tuzilgan to‘liq texnik topshiriqdagi barcha kelajak funksiyalari allaqachon bajarilganini anglatmaydi. Hozir ishlaydigan va keyingi bosqichga qolgan imkoniyatlar quyida ajratilgan.

## 2. Loyiha maqsadi va auditoriyasi

Turkiy xalqlarning qadimgi va keyingi davrlardagi yozma merosini bir platformada o‘rganish, eski turkiy so‘zlarni ommalashtirish va zamonaviy tushunchalar uchun turkiy muqobillarni muhokama qilish.

| Auditoriya | Saytdan foydalanish maqsadi |
| --- | --- |
| Keng jamoatchilik | Yodgorliklar haqida ma’lumot olish, kitob o‘qish, so‘zlarni o‘rganish. |
| 7–12 yosh | Multfilm va sodda hikoyalar orqali o‘rganish; yoshga mos topshiriqlar. |
| 12–18 yosh | Anime, hikoya va kontekstga asoslangan topshiriqlar orqali o‘rganish. |
| Katta yoshdagilar | Elektron kitoblar, ilmiy matnlar, lug‘at va korpusdan foydalanish. |
| O‘qituvchi va tadqiqotchilar | Ilmiy manbalarni izlash, o‘z ishlarini tekshiruvga yuborish. |
| Administrator | Kontentni boshqarish, ilmiy ishlarni tekshirish, kampaniya natijasini tasdiqlash. |

Asosiy yangi sahifalar o‘zbek tilida tayyorlangan. Loyiha barcha turkiy xalqlar merosini qamrashga mo‘ljallangan; hozirgi namuna bazasi barcha xalqlar va davrlarni to‘liq qamramaydi.

## 3. Saytning asosiy bo‘limlari

### 3.1. Bosh sahifa

Foydalanuvchini saytning asosiy yo‘nalishlari bilan tanishtiradi: yozma merosni kashf etish, bolalar va o‘smirlar uchun o‘rganish, kitob o‘qish. Unda yodgorlik qidiruvi, kitoblar, darslar, tanlangan yodgorliklar hamda ovoz berish va ilmiy hamkorlikka havolalar mavjud.

Bosh sahifa foydalanuvchining keyingi qadamini osonlashtiradi: kitobni ochish, darsga o‘tish yoki korpusdan izlash.

### 3.2. Yodgorliklar korpusi

Mavjud demodagi katalog, qidiruv va filtrlash imkoniyatlari saqlangan. Yodgorlik bo‘yicha nomi, davri, joyi, yozuv turi, tavsifi, asl matni, transliteratsiya, tarjima, tadqiqotchilar va bibliografiya ko‘riladi — tegishli ma’lumot bazada mavjud bo‘lsa.

Foydalanuvchi yozuv turi, kategoriya va sana oralig‘i bo‘yicha material topishi mumkin. Hozir 17 ta demo yodgorlik yozuvi mavjud. Ularning ma’lumotlari ilmiy foydalanishdan oldin mutaxassis tomonidan tekshirilishi kerak.

### 3.3. Tadqiqot vositalari

Kontekstli qidiruv, ikki yodgorlikni taqqoslash, xarita, vaqt chizig‘i, yozuv tizimlari, bibliografiya, korpus statistikasi va so‘zlar chastotasi mavjud demodan olingan. Ular alohida “Tadqiqot vositalari” sahifasiga jamlangan.

Statistik so‘z va qator sonlari mavjud demoning metama’lumotlari bo‘lishi mumkin; ularni yuklangan qisqa matn parchalari hajmi bilan tenglashtirish mumkin emas.

### 3.4. Elektron kitobxona

Kitob nomi yoki muallifi bo‘yicha qidirish, kitobni ochish va varaqlash mumkin. O‘qish oynasida mundarija, sahifadan sahifaga o‘tish, matn hajmini tanlash, qulay o‘qish rejimi va kitob ichidan qidirish mavjud.

Foydalanuvchi kitobni saqlaydi, shaxsiy qayd yozadi va keyingi tashrifda o‘qigan joyidan davom etadi. Bu ma’lumotlar hozircha shu brauzerda saqlanadi.

Kitoblar sahifalarga ajratilgan elektron matn shaklida kiritiladi. Skan yoki PDFni avtomatik to‘liq elektron matnga aylantirish ushbu MVPda yo‘q. Kitobni yuklab olish funksiyasi hozir qo‘shilmagan.

### 3.5. Bolalar va o‘smirlar bo‘limi

7–12 va 12–18 yosh guruhlari bo‘yicha darslarni ajratish mumkin. Darsda serial nomi, qism, tavsif, matn, bog‘langan so‘zlar va variantli topshiriq ko‘rsatiladi.

Foydalanuvchi javob tanlaydi, tizim javobni serverda tekshiradi va tushuntirish beradi. So‘z ustiga bosilganda uning ma’nosi, misoli va manba izohi ochiladi.

MVPda ikki matnli dars namunasi mavjud. Ular tayyor multfilm yoki anime sifatida ko‘rsatilmaydi. Haqiqiy videolar buyurtmachi tomonidan taqdim etilgach yuklanadi.

### 3.6. Sayt ichidagi video

Videolarni buyurtmachi tashqi AI vositalarida tayyorlaydi va dasturchi yoki keyinchalik kontent xodimiga beradi. MP4/WebM video admin panel orqali yuklanadi.

Foydalanuvchi videoni saytning o‘zida tomosha qiladi; boshqa platformaga o‘tishi talab qilinmaydi. Pleyerda boshlash/to‘xtatish, vaqt bo‘ylab o‘tish, ovoz va to‘liq ekran imkoniyatlari bor. Ko‘rilgan joy shu brauzerda saqlanadi.

MVP video yaratmaydi va yuklangan videoni avtomatik boshqa formatlarga aylantirmaydi. Brauzerda o‘qiladigan format va kodekdagi tayyor fayl kerak. Pleyerning sayt ichida haqiqiy video ijrosi vaqtinchalik diagnostika fayli bilan tekshirilib, sinov yozuvi olib tashlangan.

### 3.7. So‘zlar xazinasi

So‘z, ma’nosi, misoli, manba izohi va maqomi ko‘rsatiladi. Qidiruv va shaxsiy to‘plamga saqlash mavjud. Jamoatchilik tanlagan muqobillar alohida maqom bilan beriladi.

Lug‘atdagi boshlang‘ich izohlar o‘quv namunalari ekanligi manba qismida yozilgan. Haqiqiy ilmiy lug‘at uchun nashr, dalil va ekspert tekshiruvi qo‘shilishi kerak.

### 3.8. Ovoz berish

Loyiha jamoasi kampaniya savoli va so‘z variantlarini admin panelda kiritadi. Foydalanuvchi akkaunt yaratib yoki tizimga kirib ovoz beradi. Natijalarda haqiqiy ovoz soni va foizlar ko‘rsatiladi.

Bir akkaunt bitta kampaniyada bir marta ovoz beradi. Kampaniya tugagach yangi ovoz qabul qilinmaydi. Admin eng ko‘p ovoz olgan variantni tasdiqlab, lug‘atga qo‘shadi. Tenglik yoki nol ovoz bo‘lsa g‘olib avtomatik yaratilmaydi; bir natija ikki marta qo‘shilmaydi.

Hozir saytdagi ovoz berish ishlaydi. Telegram, Instagram, Facebook, X/Twitter, TikTok va YouTube ichidagi ovozlarni avtomatik olish hali ulanmagan. Namuna kampaniyasi rasmiy til me’yori yoki tarixiy dalil sifatida talqin qilinmaydi.

### 3.9. Ilmiy hamkorlik

Tizimga kirgan foydalanuvchi maqola, kitob, dissertatsiya, yodgorlik matni yoki video dars havolasini yuboradi. Nom, muallif, institut, annotatsiya va mavjud bo‘lsa manba havolasi kiritiladi. PDF fayl hajmi 20 MBgacha.

Yuborilgan ish “Admin tekshiruvida” holatiga tushadi. Muallif “Mening ishlarim” bo‘limida holatini va admin izohini ko‘radi. Nashrdan oldin ish ommaga ochilmaydi; tasdiqlangach ochiq ro‘yxatda ko‘rinadi. Admin rad etishi va izoh qoldirishi ham mumkin.

Nashrdan oldingi PDFni faqat muallif yoki admin olishi mumkin. To‘liq institut va tadqiqotchi profil sahifalari hozircha yaratilmagan; muallif va institut nomi ishning o‘zida ko‘rsatiladi.

### 3.10. Saqlanganlar va tashqi manbalar

Kitob, dars va so‘zlarni “Saqlanganlar” bo‘limiga yig‘ish mumkin. Kitob qaydlari va o‘qish/ko‘rish joyi shu brauzerga bog‘liq; boshqa qurilmaga avtomatik ko‘chmaydi. Brauzer ma’lumotlari tozalansa ular o‘chadi.

Tashqi manbalar bo‘limi admin qo‘shadigan havolalar katalogidir. Havola mavjudligi o‘sha saytning API xizmatidan avtomatik import ishlayotganini anglatmaydi. Hozircha tashqi API importi yo‘q.

## 4. Foydalanuvchining asosiy yo‘llari

| Harakat | Natija |
| --- | --- |
| Bosh sahifa → yodgorlik izlash → materialni ochish | Tavsif, matn qatlamlari va ilmiy manbalarni ko‘radi. |
| Kitobxona → kitob → keyingi varoq → qayd | O‘qiydi, qayd yozadi, keyingi safar davom etadi. |
| Yosh guruhi → dars → so‘z izohi → topshiriq | Yangi tushunchani o‘rganadi va javobini tekshiradi. |
| Ro‘yxatdan o‘tish → kampaniya → ovoz | Ovozi bazada saqlanadi va umumiy natijada hisoblanadi. |
| Ilmiy hamkorlik → ish yuborish → admin tekshiruvi | Muallif holatni kuzatadi; tasdiqlangan ish ommaga ochiladi. |

## 5. Administratorning vazifalari

- Yodgorlik va manba ma’lumotlarini tahrirlash.
- Kitoblar, sahifalar va o‘quv materiallarini kiritish.
- Tayyor video, dars matni va topshiriqlarni yuklash.
- Lug‘at so‘zlari, izoh va manbalarni boshqarish.
- Ovoz kampaniyasi va variantlarini yaratish, yakuniy g‘olibni tasdiqlash.
- Ilmiy ishlarni tekshirish, nashr qilish yoki rad etish.
- Tashqi manbalar havolalarini boshqarish.

Boshlang‘ich videolarni buyurtmachi tayyorlab beradi. Keyingi muntazam yuklashni kontent xodimi admin panel orqali bajaradi.

## 6. Hozirgi kontent holati

| Material | Holati |
| --- | --- |
| Yodgorliklar | Mavjud demodan 17 ta yozuv. Ilmiy tekshiruv talab qilinadi. |
| Elektron kitoblar | Platforma uchun yozilgan 3 ta qisqa o‘quv namunasi. |
| Darslar | 2 ta matnli dars, bog‘langan so‘zlar va topshiriqlar. |
| Videolar | Buyurtmachining haqiqiy videolari hali taqdim etilmagan; yuklash va ijro imkoniyati tayyor. |
| Ovoz berish | Sinab ko‘rish uchun belgilangan namuna kampaniya. |
| Ilmiy ishlar | Yuborish va moderatsiya tayyor; sinov uchun yaratilgan ishlar tozalangan. |

## 7. Keyingi rivojlantirish imkoniyatlari

Quyidagilar umumiy loyiha maqsadiga kiradi, ammo hozirgi MVPda bajarilgan deb hisoblanmaydi:

- Ijtimoiy tarmoqlardan ovoz olish, hisoblarni bog‘lash va takrorlarni tekshirish.
- Ochiq manbalardan API orqali avtomatik import va yangilash.
- Barcha material turlarini qamrab oladigan yagona kengaytirilgan qidiruv.
- “So‘zning sayohati”: davrlar va turkiy tillardagi shakllar, talaffuz audiosi, manbali bog‘lanishlar.
- Institut va tadqiqotchilarning alohida sahifalari.
- O‘qituvchi uchun dars to‘plami konstruktori.
- Mavzu va seriallarga obuna, bildirishnomalar, shaxsiy tavsiyalar.
- Saqlanganlar va o‘qish tarixini akkaunt orqali qurilmalar orasida sinxronlash.
- OCR, avtomatik video konvertatsiya, subtitrlarni boshqarish va moslashuvchan video sifati.
- To‘liq tekshirilgan ilmiy kontent va ko‘p tilli tarjimalar.

## 8. Qayerda va qanday ochiladi?

MVP hozir foydalanuvchining kompyuterida ishlashga tayyorlangan.

1. Loyiha papkasidagi “MVPni_ochish.cmd” faylini ikki marta bosing.
2. Dastur ishga tushgach, brauzerda http://127.0.0.1:8000/app/ ochiladi.
3. Server oynasi ishlayotgan paytda sayt ochiq bo‘ladi. To‘xtatish uchun oynada Ctrl+C bosing.
4. Admin panel: http://127.0.0.1:8000/django-admin/.
5. Mahalliy admin kirish ma’lumotlari loyihadagi .local/MVP_admin_kirish.txt faylida. Parol ushbu ulashiladigan hujjatga kiritilmagan.

Kodning internetga yuborilgani, hostingda yangilangani va domen orqali ishlashi alohida deploy jarayonida tekshiriladi. Ushbu tavsifning o‘zi deploy muvaffaqiyatli bajarilganini tasdiqlamaydi.

Hostingda yangi video yuklash uchun doimiy media xotirasi, ilmiy PDF uchun esa alohida yopiq doimiy xotira sozlangan bo‘lishi kerak. Ular sozlanmagan bo‘lsa, vaqtinchalik diskda material yo‘qolmasligi uchun bunday fayllarni yuklash to‘xtatiladi. Ilmiy ishni matn va manba havolasi bilan yuborish davom etadi.

## 9. Tayyorlik holati

Server bo‘yicha 32 ta tekshiruv va frontendning mavjud 4 ta tekshiruvi muvaffaqiyatli o‘tgan. Brauzerda kitob varaqlash, saqlash, dars topshirig‘i, akkaunt yaratish, ovoz berish, ilmiy ish yuborish va admin panelga kirish tekshirilgan. Telefon kengligidagi bosh sahifa, menyu va kitob oynasi ham ko‘rilgan.

Bu natijalar katta auditoriyaga tayyor ishlab chiqarish infratuzilmasi kafolati emas. Oyiga 100 ming tashrif uchun server, video saqlash, trafik, zaxiralash va yuklama rejasi haqiqiy foydalanish hajmiga qarab belgilanadi. Hozircha noma’lum xarajatlarga summa qo‘yilmadi.

## 10. MVP orqali tekshiriladigan asosiy g‘oya

Foydalanuvchi yodgorlik haqida ma’lumot olishi, kitob o‘qishi, hikoya va topshiriq orqali so‘z o‘rganishi, ovoz berishi yoki o‘z ilmiy hissasini yuborishi mumkin. MVP shu asosiy yo‘llarni amalda ko‘rsatadi va platformani keyingi bosqichlarda boyitish uchun tayanch beradi.
