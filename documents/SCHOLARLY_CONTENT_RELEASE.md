# Manbaga tayangan ishchi nashr: thomsen1896-v1

2026-11-06 kuni foydalanuvchi materiallarni hozir manbali ishchi holatda qo‘shish, keyinchalik mustaqil filologik tasdiqdan o‘tkazishga rozilik berdi.

## Nashr tarkibi

- 2 yodgorlik: Kultegin (732) va Bilga xoqon (735).
- 11 ta tanlangan parcha: KT E1, E2, E3–E4a, S1–S4; BK E1, E2a, N1–N2.
- 37 ta kontekstli ishchi lug‘at izohi, real parcha misollari va tarixiy shakl havolalari.
- 6 ta nashr sahifasi: 97, 98, 114, 115, 116, 122.
- 3 ta KT satri uchun runik Unicode ko‘chirma. Qolgan 8 parcha uchun runik matn taxminan yaratilmagan.
- Mustaqil filolog tasdig‘i: hozircha 0. Bu ma’lumotlar to‘liq kritik matn yoki ekspert tasdiqlagan tarjima sifatida taqdim etilmaydi.

## Tekshiriladigan asos

Vilhelm Thomsen. *Inscriptions de l’Orkhon déchiffrées*. Suomalais-Ugrilaisen Seuran Toimituksia V. Helsingfors: Imprimerie de la Société de littérature finnoise, 1896.

- To‘liq nashr: https://archive.org/details/inscriptionsdel00thomgoog
- DOI: https://doi.org/10.33341/sus.789
- Raqamlashtirish: University of Michigan / Google / Internet Archive.
- Manba PDF, OCR va sahifa indeksi: `documents/corpus_sources/`.
- Yuklangan fayllarning SHA-256 qiymatlari: `documents/corpus_sources/download-manifest.json`.
- Asosiy ma’lumot paketi: `backend/korpus/data/thomsen1896-v1.json`.

Asarning 1896-yilgi matni public domain sifatida berilgan. Skanlardagi raqamlashtirish kreditlari saqlangan. Asarning huquq holati va raqamlashtiruvchi xizmatning foydalanish qaydlari bir xil tushuncha emas; ular o‘z manbalarida ko‘rsatilgan.

KT E1/S1/S2 uchun runik Unicode ko‘chirma Turkish Wikisource hissadorlarining doimiy nusxasidan:
https://tr.wikisource.org/w/index.php?title=Orhun_Yazıtları_(Kül_Tigin)&oldid=174981

Ushbu qatlam CC BY-SA 4.0 shartlari va mualliflik havolasi bilan saqlanadi. Bu tosh yuzining fotografiyasi emas. Asl belgilar saqlanib, bo‘shliqlar bir tartibga keltirilgan. Zamonaviy turkcha tarjima ko‘chirilmadi.

## Qatlamlar nima anglatadi?

**Lotincha o‘qish:** manba bilan bog‘langan ishchi normalizatsiya. Nashrdagi yuqori kichik unlilar satrga tushirilgan; ä, ı, γ, ŋ, č, š kabi belgilar bilan o‘quv ko‘rinishi berilgan. Bu nashrning belgima-belgi diplomatik transkripsiyasi emas.

**Fransuzcha qatlam:** tarixiy nashr tarjimasidan o‘quv ko‘chirma. Tinish belgilari bir tartibga keltirilgan, ayrim qavsli izohlar va havola raqamlari qisqartirilgan. Aniq nashr matni uchun yonidagi to‘liq skan tekshiriladi.

**O‘zbekcha tarjima:** Codex tayyorlagan ishchi tarjima. Filolog tasdiqlagan tarjima deb belgilanmagan. KT S3/S4 kabi talqin farqlari mavjud joylarda ular ochiq qayd qilingan.

**Lakunalar:** shikastlangan joylar `[…]` bilan saqlanadi. BK nusxasining yetishmayotgan qismi KT nusxasidan avtomatik to‘ldirilmaydi. Parcha belgisi uning butun arxeologik satr yoki to‘liq yodgorlik emasligini bildiradi.

**Lug‘at:** nashrdagi kontekstga bog‘langan ishchi izohlar. Zamonaviy UZ/TR muqobillar ma’no bo‘yicha taqqoslashdir; etimologik qarindoshlik yoki tarixiy talaffuz sertifikati emas. Talaffuz to‘qib kiritilmagan va sintezlangan ovoz tarixiy dalil sifatida ishlatilmagan.

## Saytdagi amaliy natija

`/monuments` da 2 ta manbasi tayyorlangan yodgorlik ko‘rsatiladi. `/words` da 37 ta manbali ishchi yozuv bor. `/quality` manbaga bog‘langanlikni mustaqil ilmiy tasdiqdan alohida hisoblaydi. O‘qish oynasidagi «Nashr, asl talqin va foydalanish huquqlari» bo‘limida manba, skan, fransuzcha talqin, tarjima maqomi va huquqlar ochiladi.

Har bir nashr qilingan parallel satrda foydalanuvchi manba, taklif etilgan o‘qilish yoki tarjima va asos bilan tahririyatga tuzatish yuborishi mumkin. Takliflar `/django-admin/korpus/editorialsuggestion/` bo‘limida ko‘rib chiqiladi. Taklif yuborish nashr qilingan satrni o‘zgartirmaydi; tahririyat qarori alohida qayd qilinadi. Taklifni qabul qilishning o‘zi filologik tasdiq hisoblanmaydi — tahrirdan keyin alohida ekspert tasdig‘i talab qilinadi. API faqat tizimga kirgan foydalanuvchidan va nashr qilingan VII–VIII asr satrlari uchun taklif qabul qiladi.

Avvalgi 3 ta o‘quv lug‘at namunasi nashrdan olingan, o‘chirilmagan. Manbali parallel matni hali tayyor bo‘lmagan 5 ta boshlang‘ich yodgorlik yozuvi qoralamada saqlanadi. Importdan oldingi matn zaxirasi lokal `.local/content-before-edition-import.json` faylida.

JSON/CSV/XLSX/TEI eksportiga provenance va mustaqil tasdiq holati qo‘shilgan. Qayta tarqatishda, xususan runik Unicode qatlami uchun, satrdagi litsenziya va muallif havolalarini saqlash kerak.

## Ekspert tasdig‘i

Django admin:

- `/django-admin/korpus/monumentline/` — parallel parchalar.
- `/django-admin/korpus/wordentry/` — lug‘at.

Ekspertga tegishli modelni ko‘rish/o‘zgartirish huquqlari bilan birga `korpus.review_monumentline` va/yoki `korpus.review_wordentry` huquqi beriladi. Tegishli yozuvlarni tekshirgach, «Tanlangan matnlarni ilmiy tasdiqlash» amalidan foydalaniladi. Tizim tekshiruvchining haqiqiy hisobini va vaqtni qayd etadi.

Oddiy nashr yoki saqlash ilmiy tasdiq yaratmaydi. Tasdiqlangan matn, tarjima, manba yoki lug‘at ma’nosi o‘zgartirilsa, eski tasdiq bekor bo‘ladi va qayta tekshiruv talab qilinadi. Yangi ekspert hisobi yoki ekspert nomidan tasdiq yaratilmagan.

## Takror o‘rnatish

```powershell
$env:DJANGO_DEBUG='True'
$env:PYTHONUTF8='1'
.\.venv\Scripts\python.exe backend/manage.py migrate
.\.venv\Scripts\python.exe backend/manage.py seed_scholarly_corpus --dry-run
.\.venv\Scripts\python.exe backend/manage.py seed_scholarly_corpus --archive-samples --quarantine-unsourced
.\.venv\Scripts\python.exe backend/manage.py audit_corpus --json
```

Buyruq avvalgi tahrirlarni almashtirmaydi. Mavjud satr pozitsiyasi boshqa manbaga tegishli bo‘lsa, butun import to‘xtaydi. Qayta bajarish dublikat yaratmaydi. `--sync-excerpts` raw matn maydonlarini amaldagi parallel parchalardan qayta tuzadi; uni faqat shunday qayta tuzish kerak bo‘lganda qo‘llang.

Render build va Vercelning aniq chaqiriladigan `bootstrap_vercel` jarayoniga ushbu manba paketini o‘rnatish qo‘shildi. Bu turn davomida tashqi hostingga joylashtirish bajarilmadi.

## Tekshiruv

Backend testlari: 123 ta. Manba paketining takroriy importi, tahrirlarni saqlash, pozitsiya to‘qnashuvida rollback, haqiqiy shakldan lug‘atga o‘tish, eksportda huquqlar, soxta tasdiqning oldini olish va tahrirdan keyin tasdiqni bekor qilish tekshirildi.

Brauzer: haqiqiy nashr skani yuklanishi, fransuzcha ko‘chirma, 11/37 ko‘rsatkichlari, qapıγqa shaklidan qapıγ maqolasiga o‘tish, provenance bilan eksport va mobil o‘lcham tekshirildi. Production build ham muvaffaqiyatli tugadi.
