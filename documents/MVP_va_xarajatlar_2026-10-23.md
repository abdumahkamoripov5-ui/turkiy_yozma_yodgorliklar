# Turkiy Meros — MVP va domen/server xarajatlari

Tayyorlangan sana: 23.10.2026. Asos: ushbu repozitoriydagi React + Django korpusi va mavjud mahalliy MVP. Ushbu hujjat MVP qamrovi va internetga chiqarish budjetini birlashtiradi.

## 1. Maqsad

Turkiy yozma yodgorliklarni qidirish, asl matn, transliteratsiya va tarjimasini o‘rganish; kitob va darslardan foydalanish; so‘z muqobillariga ovoz berish va ilmiy ishlarni moderatsiya orqali nashr qilish.

Asosiy auditoriya: o‘quvchilar, talabalar, tadqiqotchilar, o‘qituvchilar va turkiy merosga qiziquvchilar.

## 2. Ishlaydigan mahalliy MVP

| Bo‘lim | Foydalanuvchiga natija |
| --- | --- |
| Korpus | Yodgorlik qidirish va filtrlash; mavjud asl matn, transliteratsiya, tarjima va manbani ko‘rish |
| Tadqiqot | Kontekstli qidiruv, taqqoslash, xarita, vaqt chizig‘i va eksport |
| Kitobxona | Kitob varaqlash, qidirish, qayd yozish va o‘qishni davom ettirish |
| Ta’lim | 7–12 va 12–18 yoshga mos darslar, so‘z izohlari va javobi serverda tekshiriladigan topshiriqlar |
| Video | Admin yuklagan tayyor MP4/WebM faylini sayt ichida tomosha qilish |
| Lug‘at | So‘z, ma’no, misol va manba izohi; saqlanganlar |
| Ovoz berish | Akkaunt orqali bir kampaniyaga bir ovoz; natija va admin tasdiqlaydigan g‘olib |
| Ilmiy hamkorlik | Ish va PDF yuborish, holatni kuzatish; admin tasdig‘idan keyin nashr |
| Admin | Materiallar, kampaniyalar va ilmiy ishlarni boshqarish |

Boshlang‘ich kontent tavsifi: 17 demo yodgorlik, 3 qisqa o‘quv kitobi, 2 matnli dars va namuna ovoz kampaniyasi. Tarixiy ma’lumotlarni ilmiy nashr uchun ekspert tekshiradi. Tayyor haqiqiy videolar hali taqdim etilmagan. Qaydlar va o‘qish tarixi shu brauzerda saqlanadi.

MVPni ochish: loyiha ildizidagi MVPni_ochish.cmd faylini ikki marta bosing. Manzil: http://127.0.0.1:8000/app/. Admin: http://127.0.0.1:8000/django-admin/. Batafsil yo‘riqnoma: documents/MVP_QOLLANMA.md.

## 3. Birinchi internet versiyasi uchun tuzilma

Bitta Linux VPSda Nginx + Gunicorn + Django, React build va PostgreSQL joylashtiriladi. PostgreSQL shu VPS tarkibida bo‘ladi; alohida boshqariladigan baza xizmati uchun to‘lov kiritilmadi. Domen shu serverga yo‘naltiriladi, HTTPS uchun bepul Let’s Encrypt sertifikati qo‘llanadi.

Rasm/video va ilmiy PDFlar uchun Cloudflare R2da alohida ochiq va yopiq bucketlar ishlatiladi. Nashr qilinmagan PDFlar yopiq saqlanadi. Har kuni bazaning mantiqiy zaxirasi olinadi; bundan tashqari VPSning haftalik backup xizmati yoqiladi. R2ga chiqarilgan media VPS backupiga kirmaydi, uning alohida nusxasi kerak.

2 GB RAMli server kichik pilot uchun boshlang‘ich tanlov. 100 ming oylik tashrif yoki katta video auditoriyasi uchun quvvat kafolati emas; haqiqiy parallel yuklama va trafik o‘lchanadi. Ko‘proq yuklama uchun quyida 4 GB variant ham berilgan.

## 4. Domen va server smetasi

Hisoblash uchun 1 USD = 12 000 so‘m rejalashtirish kursi olindi. Bu bankning amaldagi ayirboshlash kursi emas. Yillik server summalari 12 oylik tarif yig‘indisi; yillik chegirma faraz qilinmagan.

| Xarajat | Oylik hisob | Yillik hisob |
| --- | --- | --- |
| .UZ domen, BILLURCOM ochiq aksiyasidagi ro‘yxatdan o‘tkazish | 2 250 so‘m ulush | 27 000 so‘m |
| DigitalOcean Basic: 1 vCPU, 2 GB RAM, 50 GB SSD | $12 = 144 000 so‘m | $144 = 1 728 000 so‘m |
| Haftalik VPS backup, server narxining 20 foizi | $2.40 = 28 800 so‘m | $28.80 = 345 600 so‘m |
| R2 Standard, bepul hajm va so‘rov chegaralari ichida | $0 | $0 |
| HTTPS sertifikati, Let’s Encrypt | 0 so‘m | 0 so‘m |
| Jami, birinchi yil | 175 050 so‘m o‘rtacha | 2 100 600 so‘m |

Domen oylik olinmaydi: 27 000 so‘m bir yil uchun oldindan to‘lanadi. Birinchi to‘lov: server $12 + backup $2.40 + domen 27 000 = taxminan 199 800 so‘m. Keyingi oylarda server va backup taxminan 172 800 so‘m. Jadvaldagi 175 050 so‘m domenning yillik narxi 12 oyga bo‘lingan o‘rtacha ko‘rsatkichdir.

Yangilash narxi uchun BILLURCOM e’lonidagi 28 000 so‘m/yil olinsa, keyingi yil jami 2 101 600 so‘m, oyiga o‘rtacha 175 133 so‘m bo‘ladi. Aksiya va yangilash tarifi xarid paytidagi hisob-fakturada qayta tasdiqlanadi. Domen nomining bandligi tekshirilmagan.

### Kengaytirilgan variant

DigitalOcean Basic 2 vCPU, 4 GB RAM, 80 GB SSD: $24/oy. Haftalik backup $4.80/oy. Domen bilan jami: oyiga o‘rtacha 347 850 so‘m; birinchi yil 4 174 200 so‘m. Bu ham yuklama testi o‘rnini bosmaydi.

### Media hajmi oshganda

R2 Standard uchun oyiga 10 GB saqlash, 1 million Class A va 10 million Class B operatsiyasi bepul. Ortiqcha saqlash $0.015/GB-oy; yozish/tahrirlash operatsiyalari $4.50/million, o‘qish operatsiyalari $0.36/million. R2dan to‘g‘ridan-to‘g‘ri tashqi trafik bepul; boshqa pullik xizmatlarni ulash xarajat qo‘shishi mumkin.

Misol: barcha bucketlar va backup nusxalari jami doimiy 100 GB egallasa, saqlashning o‘zi (100 − 10) × $0.015 = $1.35/oy, taxminan 16 200 so‘m/oy yoki 194 400 so‘m/yil. So‘rovlar bepul chegarada qolgan va hajm yil davomida o‘zgarmagan deb olindi. Alohida media backup nusxalari ham umumiy hajmga qo‘shiladi.

Amaliy boshlang‘ich budjet sifatida oyiga 200–250 ming so‘m, yiliga 2,4–3 million so‘m ajratish mumkin. Bu pilot uchun rejalashtirish zaxirasi; xizmatlarning kafolatlangan yakuniy hisob-fakturasi emas.

## 5. Alohida hisoblanadigan ishlar

Yuqoridagi summa infratuzilma uchun. Dasturchi mehnati, doimiy texnik xizmat, kontent kiritish, ilmiy tahrir, tarjima, video ishlab chiqarish, pullik AI/API, pochta/SMS va reklama kiritilmagan. Soliq, bank komissiyasi, kurs farqi va limitdan oshgan trafik qo‘shilishi mumkin. Ushbu MVPning asosiy funksiyalari uchun pullik AI obunasi shart emas.

Keyingi bosqich: ijtimoiy tarmoqlardan ovoz yig‘ish, Telegram bot, avtomatik manba importi, OCR, video konvertatsiyasi, qurilmalararo tarix va to‘liq ko‘p tilli kontent. Bular hozir ishlaydi deb hisoblanmaydi.

## 6. Internetga chiqarish va qabul qilish

1. Domen, VPS va R2 buyurtmachi hisobida ochiladi; xarid ushbu ish doirasida bajarilmadi.
2. Production maxfiy kalitlari, domenlar, PostgreSQL hamda ochiq/yopiq fayl xotirasi sozlanadi.
3. Frontend build, migratsiyalar va statik fayllar tayyorlanadi; DEBUG o‘chiriladi.
4. HTTPS, qidiruv, kitob, topshiriq, ovoz berish va ilmiy ish moderatsiyasi domen orqali tekshiriladi.
5. Backup jadvali yoqiladi, bazani va fayllarni nusxadan tiklash sinovi bajariladi.

Mahalliy MVP va hostingga chiqarilgan sayt alohida holatlar. Ushbu topshiriqda yangi internet deploy bajarilmadi.

23.10.2026 kungi qayta tekshiruv: backendning 32 ta testi va frontendning 4 ta testi o‘tdi; /app/ uchun production build muvaffaqiyatli tayyorlandi. Ushbu safar brauzerda qayta tekshirish bajarilmadi.

## 7. Narx manbalari

23.10.2026 kuni ko‘rilgan ochiq sahifalar:

- DigitalOcean VPS tariflari: https://www.digitalocean.com/pricing/droplets
- DigitalOcean backup tarifi: https://docs.digitalocean.com/products/backups/details/pricing/
- BILLURCOM .UZ aksiyasi: https://www.billur.com/promotions/
- BILLURCOM domen yangilash e’loni (31.05.2024; xarid vaqtida qayta tekshiriladi): https://www.billur.com/announcements/557
- Cloudflare R2: https://developers.cloudflare.com/r2/pricing/

Narxlar konfiguratsiya, hudud, tarif va amaldagi aksiyalarga qarab o‘zgarishi mumkin. Eski documents/pricing_snapshot_2026-10-12.json ushbu yangi hisob uchun valyuta kursi sifatida qo‘llanilmadi.
