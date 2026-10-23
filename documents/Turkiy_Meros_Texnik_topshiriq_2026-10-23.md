# TURKIY MEROS — TEXNIK TOPSHIRIQ

Versiya: 1.0. Sana: 23.10.2026. Asos: mavjud sayt va “Turkiy Meros — birja uchun MVP topshirig‘i”. Ish muddati: shartnoma boshlangan kundan 3 oy.

## 1. Maqsad va natija

Turkiy xalqlarning yozma merosini topish, o‘qish, o‘rganish va tadqiq qilish uchun yagona veb-platforma yaratiladi. Platforma korpus, kutubxona, video ta’lim, tarixiy so‘zlar lug‘ati, ovoz berish va ilmiy hamkorlikni birlashtiradi.

Natija: .uz domenida ishlaydigan sayt, admin panel, Telegram bot, kelishilgan importlar, shaxsiy kabinet va foydalanish hujjatlari. Interfeys o‘zbek lotin yozuvida. Kontent tili va yozuvi alohida saqlanadi; boshqa interfeys tillarini keyinchalik qo‘shish mumkin bo‘ladi.

Mavjud React + Django sayt funksional namuna hisoblanadi. Ijrochi uni davom ettirishi yoki asoslab boshqa yechim taklif qilishi mumkin. Qayta ishlab chiqilganda kelishilgan mavjud ma’lumotlar ko‘chiriladi va eski ochiq havolalar yangi sahifalarga yo‘naltiriladi.

## 2. Rollar va huquqlar

| Rol | Huquqlar |
| --- | --- |
| Mehmon | Ochiq materiallarni qidirish, kitob o‘qish, video tomosha qilish va natijalarni ko‘rish |
| Foydalanuvchi | Ovoz berish, saqlash, qayd yozish, obuna, topshiriq bajarish va material taklif qilish |
| Tadqiqotchi | Profil, ilmiy ish qoralamasi, yuborish, holat va moderator izohini ko‘rish |
| O‘qituvchi | Dars to‘plami tuzish, ulashish va o‘z to‘plamiga biriktirilgan natijalarni ko‘rish |
| Muharrir/ekspert | Biriktirilgan kontentni tekshirish, tahrirlash va tasdiqlashga yuborish |
| Administrator | Nashr, moderatsiya, rollar, kampaniyalar, importlar va sozlamalarni boshqarish |

Ochiq o‘qish va tomosha uchun akkaunt majburiy emas. Shaxsiy qayd va o‘rganish natijasini faqat egasi ko‘radi; o‘qituvchiga faqat uning darsidagi tegishli natija beriladi. Rollar serverda ham tekshiriladi.

## 3. Sahifalar tarkibi

Bosh sahifa; umumiy qidiruv; korpus katalogi va yodgorlik sahifasi; kontekstli qidiruv; taqqoslash; xarita; vaqt chizig‘i; lug‘at va so‘z sahifasi; kitobxona va kitob o‘qish; bolalar/o‘smirlar katalogi va video dars; kampaniyalar va ovoz sahifasi; ilmiy ishlar va yuborish; tadqiqotchi/institut profili; dars to‘plami; 7 kunlik sayohat; shaxsiy kabinet; bildirishnomalar; admin panel; foydalanish va maxfiylik sahifalari.

## 4. Funksional talablar

### F01. Bosh sahifa va yagona qidiruv

- Bosh sahifada qidiruv, kun so‘zi, yosh bo‘limlari, yangi kitob/video va faol kampaniyalar chiqadi.
- Qidiruv yodgorlik nomi va matn qatlamlari, lug‘at, elektron kitob matni, ilmiy ish tavsifi va video tavsifi/subtitri bo‘yicha ishlaydi.
- Filtrlar: material turi, xalq, til, davr, yozuv, mavzu va yosh guruhi. Saralash: moslik, nom va sana. Filtrlar URLda saqlanadi; natijalar sahifalanadi.
- Natijada sarlavha, turi, mos parcha va manbaga o‘tish chiqadi. Katta-kichik harf va o‘zbek apostrofi variantlari tenglashtiriladi; asl matn o‘zgartirilmaydi.
- Elektron matni yo‘q skan ichki qidiruvga kirmaydi. Admin OCR/transkripsiya qo‘shsa qidiruvga olinadi.

### F02. Ilmiy korpus

- Yodgorlik maydonlari: asosiy/asl/muqobil nom, xalq, til, yozuv, davr/sana oralig‘i, topilgan va saqlanadigan joy, koordinata, tavsif, tasvir, manba, bibliografiya, huquq va tekshiruv holati.
- Asl matn, transliteratsiya, mavjud transkripsiya va tarjima alohida saqlanadi; alohida yoki yonma-yon ochiladi.
- Satrlar doimiy identifikatorga ega bo‘ladi. Admin moslashtirgan satr tanlanganda tegishli tarjima va transliteratsiya ajraladi. Satrga alohida havola beriladi.
- Kontekstli qidiruv topilgan so‘zning chap/o‘ng matnini va qidirilgan qatlamni ko‘rsatadi. Ikki yodgorlik taqqoslanadi.
- Xarita va vaqt chizig‘i katalog filtrlariga bog‘lanadi. Iqtibos nusxalanadi; ochiq ma’lumot CSV/JSONga chiqariladi. Statistika bazadan hisoblanadi.

### F03. Lug‘at va so‘zlar bog‘lanishi

- So‘z maydonlari: tarixiy shakl, o‘qilishi, ma’nolar, til/davr, misol, yodgorlik/satr, hozirgi turkiy tillardagi shakllar, manbalar, ekspert izohi va mavjud audio.
- Maqomlar: tarixiy manbada qayd etilgan; muqobil sifatida taklif etilgan; jamoatchilik tanlagan. Har biri sahifada ko‘rsatiladi.
- So‘zdan bog‘liq kitob, video, topshiriq va kampaniyaga o‘tiladi. “So‘zning sayohati” tarixiy dalildan bugungi qo‘llanishgacha bog‘lanishlarni ko‘rsatadi.
- Foydalanuvchi boshqa turkiy tildagi shakl va manbasini yuboradi; ekspert tasdig‘idan keyin chiqadi.

### F04. Elektron kutubxona

- Katalog: nom, muallif, til, mavzu, davr va tur bo‘yicha qidiruv/filtr.
- Kitob: muqova, nashr ma’lumoti, tavsif, manba va mundarija. PDF/skan varaqlash, sahifa raqami bilan o‘tish, kattalashtirish va to‘liq ekran.
- Tayyor elektron matnda mobil o‘qish rejimi, shrift o‘lchami, kitob ichidan qidirish, lug‘at izohi va parchaga havola bo‘ladi.
- Xatcho‘p, qayd va oxirgi o‘qilgan joy akkauntda saqlanib, boshqa qurilmada tiklanadi. Faylni yuklab olishni admin yoqadi/o‘chiradi; boshlang‘ich holat o‘chiq.

### F05. Video va yoshga mos ta’lim

- Guruhlar: 7–12 yosh, 12–18 yosh va kattalar. Kontentning yosh oralig‘i admin tomonidan belgilanadi.
- Serial/mavsum/qism, muqova, tavsif, til, davomiylik, subtitr, bog‘liq so‘zlar va topshiriqlar kiritiladi.
- Video sayt ichida tashqi akkauntsiz ishlaydi. Pleyer: ijro/to‘xtatish, vaqt, ovoz, to‘liq ekran, subtitr va tayyor sifat variantlarini tanlash.
- Katta video yuklash davom ettiriladi; zarur konvertatsiya fonda bajariladi. HLS yoki teng yechim bilan moslashuvchan sifat beriladi. Video tayyorlanayotganda holati ko‘rinadi.
- Ko‘rilgan joy akkauntda saqlanadi. Keyingi qism va serialga obuna mavjud; avtomatik ijroni o‘chirish mumkin.
- Topshiriqlar: variantli savol, rasm–so‘z moslashtirish, eshitib topish, dialogni to‘ldirish va kontekstdan ma’no tanlash. Javob serverda tekshiriladi, izoh va natija saqlanadi.
- Tayyor boshlang‘ich videolarni buyurtmachi beradi. Sayt ichida AI video yaratish talab qilinmaydi.

### F06. Ovoz berish va ijtimoiy kanallar

- Admin tushuncha/savol, 2–4 variant, izoh, manba, boshlanish/tugash vaqti va hisoblash qoidasini kiritadi.
- Bir bog‘langan hisob kampaniyaga bir marta ovoz beradi. Takroriy/parallel so‘rov va Telegram webhooki natijani ko‘paytirmaydi; yagonalik bazada ta’minlanadi.
- Telegram hisobni bir martalik tasdiq orqali bog‘laydi; bot kampaniyani ko‘rsatadi, ovozni qabul qiladi va sayt bilan bir xil natijadan foydalanadi.
- Instagram, Facebook, X, TikTok va YouTube uchun havola, QR va ulashish kartasi tayyorlanadi. Ichki ovoz importi faqat shartnomaga kiritilgan va API ruxsati tasdiqlangan kanal uchun bajariladi.
- Bog‘lanmagan tashqi umumiy sonlar asosiy individual ovozlarga qo‘shilmaydi; manbasi bilan alohida ko‘rsatiladi.
- Muddat tugagach ovoz yopiladi. Tenglikda yoki nol ovozda g‘olib belgilanmaydi. Admin tasdig‘idan keyin g‘olib bir marta lug‘atga qo‘shiladi; kampaniya va natija bog‘lanadi.
- Ovozlarni bekor qilish sababi va admin amallari tarixda saqlanadi. Natijada ovoz soni va foizlar ko‘rinadi.

### F07. Ilmiy hamkorlik va dars to‘plami

- Maqola, kitob, dissertatsiya, yodgorlik matni yoki video dars yuboriladi. Maydonlar: nom, mualliflar, institut, til, mavzu, yil, annotatsiya, fayl/havola, manba va foydalanish sharti.
- Holatlar: qoralama → yuborilgan → tekshirilmoqda → tuzatishga qaytarilgan / rad etilgan / nashr qilingan. Muallif izohni ko‘radi va qayta yuboradi.
- Nashrgacha fayl faqat muallif va vakolatli moderatorga ochiladi. Nashr qilingan ish tahriri yangi tekshiruvdan o‘tadi.
- Tadqiqotchi va institut sahifasida tanishtiruv, yo‘nalish va tasdiqlangan ishlar chiqadi. Tasdiqlangan mansublik alohida belgilanadi.
- O‘qituvchi matn, kitob, video va savollardan tartibli to‘plam yaratadi; qoralama/nashr rejimi, ulashish havolasi va topshiriq natijasi bo‘ladi.

### F08. Shaxsiy kabinet va jalb qiluvchi funksiyalar

- Elektron pochta bilan ro‘yxatdan o‘tish, tasdiqlash, kirish, chiqish va parol tiklash. Yosh guruhi, qiziqish va tillar tanlanadi.
- Saqlanganlar, shaxsiy qayd, o‘qish/ko‘rish tarixi, o‘rganilgan so‘zlar va natijalar serverda saqlanadi.
- Kun so‘zi: admin belgilagan so‘z + bitta savol + ulashish kartasi.
- 7 kunlik sayohat: kuniga 5 so‘z; yakunda 10 savol; yakunlash natijasi va shaxsiy nishon. O‘tish mezonini admin belgilaydi.
- Haftaning muqobili: F06 kampaniyasi asosida haftalik mavzu, ovoz va yakuniy sharh.
- Serial, mavzu, til, muallif va institutga obuna; sayt ichidagi bildirishnoma va uni o‘chirish sozlamasi.
- Qiziqish, yosh va til bo‘yicha keyingi 3 material tavsiya qilinadi. Alohida pullik AI tavsiya xizmati majburiy emas.
- Admin hisobotlari: tashrif, qidiruv, material ochilishi, dars tugallanishi, sayohat boshlanish/yakunlanishi, haqiqiy ovoz, ulashish havolasidan kirish, 7/30 kunlik qaytish. Bot trafik va takror hodisalarni ajratish usuli hujjatlashtiriladi.

### F09. Tashqi import va admin

- Har tashqi manba uchun shartnoma ilovasida nom, API manzili, maydonlar, ruxsat/litsenziya, yangilash davri va limit yoziladi. Adapterlar soni oldindan kelishiladi.
- Import: olish → tekshirish → dublikatni aniqlash → admin ko‘rigi → nashr. Manba IDsi, URL va import vaqti saqlanadi; qo‘lda tahrirlar izsiz almashtirilmaydi.
- Fon vazifalarida qayta urinish, limit va xato jurnali bo‘ladi. Tashqi manba uzilsa asosiy sayt ishlaydi.
- Admin kontent, fayl, lug‘at, topshiriq, kampaniya, foydalanuvchi roli va importni boshqaradi. CSV/JSON import namunasi va qator bo‘yicha xato hisoboti beriladi.
- Nashr holati, oldindan ko‘rish, nashrdan olish, versiya va kim/qachon o‘zgartirgani saqlanadi.

## 5. Ma’lumotlar va API

Asosiy obyektlar: foydalanuvchi/rol, til/xalq/yozuv/davr, yodgorlik/satr/tarjima, lug‘at so‘zi/manba, kitob/sahifa, serial/video/subtitr, topshiriq/javob, kampaniya/variant/ovoz, ilmiy ish/reviziya, institut/profil, dars to‘plami, saqlangan/qayd/progress, obuna/bildirishnoma, tashqi manba/import va audit.

Obyektlar barqaror IDga ega bo‘ladi. Aloqador materiallar ID orqali ulanadi. Ochiq API faqat nashr qilingan yozuvlarni qaytaradi; shaxsiy API foydalanuvchini tekshiradi. Kataloglarda serverda sahifalash va filtr ishlaydi. API tavsifi OpenAPI yoki teng shaklda topshiriladi.

## 6. Dizayn, xavfsizlik va ishlash

- Telefon, planshet va kompyuter: 360, 768 va 1440 pikselda asosiy sahifalar tekshiriladi. Tarixiy Unicode va kerakli yozuv yo‘nalishlari to‘g‘ri ko‘rinadi.
- Klaviatura boshqaruvi, fokus, forma yorliqlari va o‘qiladigan kontrast; yuklanish, bo‘sh natija va xato holatlari o‘zbekcha.
- Ochiq sahifalar uchun sarlavha, meta tavsif, canonical, ulashish tasviri, sitemap va indekslanadigan kontent.
- HTTPS, xavfsiz parol saqlash, serverda ruxsat nazorati, kirish/ovoz/formalarda so‘rov cheklovi. Maxfiy kalitlar frontend va ochiq jurnallarga chiqmaydi.
- Fayl turi, haqiqiy mazmuni va hajmi serverda tekshiriladi. PDF, rasm, video va subtitr format/hajm limitlarini ijrochi arxitektura ilovasida raqam bilan belgilaydi.
- Qoralama va ilmiy PDF uchun yopiq xotira; ommaviy media alohida. Server yangilanganda baza va fayllar saqlanadi.
- Baza har kuni zaxiralanadi, kamida 7 kunlik nusxa saqlanadi. Media uchun alohida inkremental nusxa; tiklash sinovi bajariladi.
- Baza indekslari, keshlash, fon vazifalari va media tarqatish asosiy sahifalardan ajratiladi. Disk, xatolar, import va video vazifalari kuzatiladi.

Maqsad: oyiga 100 000 tashrif. Shartnoma oldidan yuklama ilovasi to‘ldiriladi: bazadagi yozuvlar va matn hajmi, parallel o‘quvchi/tomoshabinlar, video sifati/trafik, p95 javob vaqti va xato ulushi chegarasi. Ijrochi shu raqamlarga mos sinov hisoboti beradi.

## 7. Qabul qilish sinovlari

| № | Sinov | Qabul natijasi |
| --- | --- | --- |
| Q01 | Qidiruv, apostrof variantlari, filtrli havola | Kelishilgan namunalar topiladi, filtr havolasi qayta ochiladi |
| Q02 | Yodgorlikning bog‘langan satri | Asl matn, transliteratsiya va tarjima mos ajraladi; satr havolasi ochiladi |
| Q03 | Kitob va video progressi | Boshqa qurilmada shu akkaunt oxirgi joyni tiklaydi |
| Q04 | Dars topshirig‘i va 7 kunlik sayohat | Javob serverda tekshiriladi, natija va yakunlash saqlanadi |
| Q05 | Sayt/bot orqali takroriy va parallel ovoz | Bitta bog‘langan hisobdan natija faqat bir ovozga oshadi |
| Q06 | Muddat, tenglik va takroriy tasdiq | Ovoz yopiladi; noto‘g‘ri g‘olib va takror lug‘at yozuvi yo‘q |
| Q07 | Ilmiy ish va yopiq fayl | Begona hisob nashrgacha ocha olmaydi; tuzatish va qayta yuborish ishlaydi |
| Q08 | Dars to‘plami, obuna va tavsiya | Havola ochiladi, tegishli natija va yangi material xabari ko‘rinadi |
| Q09 | Importni qayta ishga tushirish va uzilish | Dublikat yo‘q; xato qayd etiladi; asosiy sayt ishlaydi |
| Q10 | Admin orqali kontent kiritish | Kitob, video, so‘z, topshiriq va kampaniya dasturchisiz nashr qilinadi |
| Q11 | Xavfsizlik, mobil va brauzer | Rol va fayl cheklovlari bajariladi; Chrome, Firefox, Edge va mobil Safari asosiy yo‘llari ishlaydi |
| Q12 | Deploy, backup va yuklama | Media saqlanadi; baza/fayl tiklanadi; kelishilgan yuklama chegaralari bajariladi |

## 8. Uch oylik ish bosqichlari

| Davr | Ish | Topshiriladigan natija |
| --- | --- | --- |
| 1–2-hafta | Talablar, dizayn tuzilmasi, model, integratsiya va yuklama ilovalari | Tasdiqlangan maket, arxitektura, ish va narx jadvali |
| 3–4-hafta | Akkaunt, admin, korpus va qidiruv | Sinov muhitidagi asosiy sayt |
| 5–8-hafta | Lug‘at, kutubxona, video, topshiriq, ilmiy hamkorlik va to‘plamlar | Kontent va ta’lim modullari |
| 9–10-hafta | Ovoz, Telegram, import, obuna va jalb qiluvchi funksiyalar | Birlashtirilgan funksional versiya |
| Qolgan muddat | Kontent migratsiyasi, xavfsizlik/yuklama sinovi va deploy | Ishchi sayt, qabul dalillari va hujjatlar |

## 9. Domen va server smetasi

23.10.2026 kungi MVP smetasi asosida. Asosiy server O‘zbekistonda. Chegirmasiz, so‘mda hisob.

| Band | Oyiga | Yiliga |
| --- | --- | --- |
| UZTELECOM .uz domen | 2 666,67 — yillik ulush | 32 000 |
| BILLURCOM VPS 4+: 4 vCPU, 12 GB RAM, 100 GB SSD | 1 495 000 | 17 940 000 |
| Jami domen va server | 1 497 666,67 — o‘rtacha | 17 972 000 |

Yillik hisob: 1 495 000 × 12 + 32 000 = 17 972 000 so‘m. Birinchi oy: 1 527 000 so‘m. Keyingi oylarda: 1 495 000 so‘m. Uch oylik server + bir yillik domen: 4 517 000 so‘m.

Qo‘shimcha 100 GB disk zarur bo‘lsa: +200 000 so‘m/oy, +2 400 000 so‘m/yil. Tanlangan VPS quvvati yuklama sinovida tasdiqlanadi. Dasturlash, alohida backup, video xotirasi/tarqatish va pullik APIlar alohida narxlanadi; bu bandlar yuqoridagi jamiga kirmaydi.

Tarif manbalari:
- https://uztelecom.uz/uz/jismoniy-shaxslarga/bulutli-xizmatlar/web-hosting-va-domen/
- https://www.billur.com/vps/?language=english&tarif=vps1

## 10. Topshirish va shartnoma ilovalari

Ijrochi topshiradi: to‘liq kod va o‘zgarishlar tarixi, dizayn maketlari, ishchi sayt/admin/bot, migratsiyalar, import namunalari, API tavsifi, sozlamalar namunasi, o‘rnatish/yangilash/backup yo‘riqnomasi, admin qo‘llanmasi, sinov va yuklama hisoboti. Domen, server, repozitoriy, baza, media va bot buyurtmachi hisobida bo‘ladi.

Shartnoma imzolanishidan oldin quyidagi ilovalar raqam bilan to‘ldiriladi:
1. Kiritiladigan yodgorlik, so‘z, kitob, video va topshiriqlar soni; umumiy fayl hajmi; kiritishga mas’ul tomon.
2. Tashqi manbalar va ijtimoiy kanallar: aniq nom, usul, ruxsat, API narxi va olinadigan maydonlar.
3. Video formatlari, fayl limitlari, xotira/trafik va backup hajmi hamda oylik/yillik narxi.
4. Yuklama sinovining sonli mezonlari va sinov konfiguratsiyasi.
5. Modullar bo‘yicha dasturlash narxi, to‘lov bosqichlari va boshlanish/tugash sanalari.

Taklif etiladigan kafolat: qabuldan keyin 30 kun davomida ushbu talablarga zid xatolar bepul tuzatiladi. Yangi funksiyalar va muntazam texnik xizmat alohida kelishiladi.
