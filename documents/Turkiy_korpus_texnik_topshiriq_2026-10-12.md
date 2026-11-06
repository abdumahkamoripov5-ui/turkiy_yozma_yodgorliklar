# Turkiy yozma yodgorliklar korpusi

Texnik topshiriq va minimal xarajatlar smetasi. 12.10.2026.

## Loyiha pasporti va qisqa xulosa

Loyiha nomi: Turkiy yozma yodgorliklar korpusi. Hujjat turi: mavjud demo asosida ishlab chiqiladigan texnik topshiriq va minimal xarajatlar smetasi. Versiya: 1.0. Sana: 12.10.2026. Valyuta: UZS va USD.

Maqsad — qadimgi turkiy yozma merosni ommaga tushunarli shaklda taqdim etish, tarixiy so‘zlarning bugungi ma’nosi va zamonaviy so‘zlarga mos turkiy muqobillarini jamoatchilik ishtirokida aniqlash. Sayt, Telegram, X/Twitter, TikTok, YouTube va Instagram kampaniyalari yagona bazaga bog‘lanadi.

Eng ko‘p haqiqiy ovoz to‘plagan, oldindan ekspert tekshiruvidan o‘tgan so‘z korpusda “jamoatchilik tanlagan zamonaviy muqobil” sifatida belgilanadi. Bu platforma natijasidir; ovoz berishning o‘zi so‘zga rasmiy til me’yori maqomini bermaydi.

| Ko‘rsatkich | Minimal reja |
| --- | --- |
| Texnologiya | React + Django REST + PostgreSQL + self-hosted n8n |
| Asosiy so‘rovnoma | Saytda yagona ovoz berish; Telegram bot bilan qo‘shimcha integratsiya |
| Yoshga mos kontent | 0–6, 7–12, 13–17 va 18+; yosh noma’lum bo‘lsa xavfsiz boshlang‘ich rejim |
| Xorijiy VPS bilan oylik budjet | 204 514,30 so‘m — $5 AI zaxirasi va domenning oylik ulushi bilan |
| Mahalliy VPS bilan oylik budjet | 381 739,50 so‘m — xuddi shu AI va domen shartlari bilan |
| MVP muddati / ish smetasi | 6 hafta / 200 soat; 10 000 000 so‘m — rejalashtirish bahosi, bozor kotirovkasi emas |

Hujjat talablarni belgilaydi; so‘rovnoma, n8n va bolalar bo‘limi hozirgi demo saytga hali implementatsiya qilinmagan. Domenning bandligi va tanlangan hosting joylashuvi xarid oldidan tekshiriladi.

## 1. Qamrov, mavjud demo va yetkaziladigan natija

Mavjud demo: yodgorliklar katalogi, qidiruv va filtrlar, asl yozuv, transliteratsiya va tarjima, konkordans, xarita, vaqt chizig‘i, taqqoslash, bibliografiya, lug‘at, statistika, taklif yuborish va Django admin moderatsiyasi. Mavjud ma’lumotlar, URL va funksiyalar saqlangan holda kengaytiriladi.

| MVPga kiradi | Keyingi bosqichga qoldiriladi |
| --- | --- |
| So‘z kartochkasi, variantlar, ovoz va natijalar | Barcha tarmoqlarning ichki ovozlarini cheklovsiz avtomatik yig‘ish |
| Telegram bot, manbali havolalar, n8n jarayonlari | Pullik X API, TikTok Research API va maxsus Meta ruxsatlari |
| Yoshga mos, ekspert tasdiqlagan kontent | Cheklanmagan AI chat, AI video/rasm yaratish |
| Admin nazorati, eksport, audit va backup | Mobil native ilova, murakkab lingvistik annotatsiya tizimi |

Yetkaziladigan natijalar: yangilangan sayt; PostgreSQL migratsiyalari; Telegram bot sozlamalari; n8n workflow JSON fayllari; API tavsifi; deployment yo‘riqnomasi; administrator qo‘llanmasi; test natijalari; backup va tiklash yo‘riqnomasi.

Buyurtmachi so‘zlar ro‘yxati, foydalanish huquqi bor manbalar, ekspert va moderatorni, ijtimoiy tarmoq akkauntlarini hamda hosting/domen hisoblarini taqdim etadi. Boshlang‘ich qabul hajmi: 50 tekshirilgan so‘z, 10 faol yoki yopilgan so‘rovnoma, 20 yoshga mos kartochka. Bu hajmlar shartnoma uchun taklif etilgan MVP mezonlaridir.

Domen va akkauntlar buyurtmachi nomida ochiladi. Kod repozitoriysi va infra kirishlari unga topshiriladi. Hujjatdagi tavsiya etilgan talablar va hajmlar tasdiqlangach ijro asosiga aylanadi.

## 2. So‘zlar va foydalanuvchi jarayoni

Ikki tadqiqot yo‘nalishi qo‘llab-quvvatlanadi: A) tarixiy so‘zning hozirgi ma’nosini aniqlash; B) bugungi so‘z yoki tushunchaga tarixiy turkiy ildiz asosida muqobil topish. Har bir kampaniyada yo‘nalish va ma’no konteksti aniq yoziladi.

Jarayon: manbadan so‘z ajratish → ekspert tekshiruvi → 2–4 muqobilni tasdiqlash → kampaniyani ochish → saytda/Telegramda ovoz olish → tekshirish va takrorlarni chiqarish → muddatni yopish → g‘olibni hisoblash → korpus kartochkasiga natijani yozish.

| Qadam | Foydalanuvchi ko‘radigan ma’lumot |
| --- | --- |
| 1. Kirish | Yosh rejimi; ommaviy kontentni akkauntsiz o‘qish |
| 2. So‘z sahifasi | Asl shakl, transliteratsiya, manba, oddiy izoh, tarixiy kontekst |
| 3. Tanlash | Bir xil ma’noga oid 2–4 variant; “boshqa variant taklif qilish” alohida |
| 4. Ovoz | Ishtirokchi tokeni yoki hisob tasdig‘i; tushunarli ovoz tugmasi |
| 5. Yakun | Saqlangan ovoz, kampaniya muddati, ochiq metodologiya |
| 6. Natija | G‘olib, haqiqiy ovozlar, foiz, ishonchlilik cheklovi va versiya |

Variant nomlari matn sifatida emas, barqaror candidate_id orqali saqlanadi. Bir kampaniyada sinonim bo‘lmagan ma’nolar aralashtirilmaydi. “Bilmayman” yoki “hech biri” javobi alohida hisoblanadi va muqobil so‘z sifatida g‘olib bo‘la olmaydi.

Sayt g‘olibni tushunarli izoh bilan ko‘rsatadi: “Ushbu so‘rovnoma ishtirokchilari tanlagan variant”. Ishtirokchilar butun aholi vakillari deb talqin qilinmaydi. Misol matnlari va tarixiy dalillar manbasi bilan beriladi; AI tavsifi dalil o‘rnini bosa olmaydi.

## 3. Ijtimoiy platformalar va integratsiya chegaralari

| Kanal | MVP usuli | Ichki so‘rovnoma / cheklov |
| --- | --- | --- |
| Sayt | Yagona /polls/{slug} sahifasi va serverga ovoz | To‘liq nazorat va individual ovoz saqlash |
| Telegram | Bot havolasi yoki botning shaxsiy chatidagi non-anonymous poll | Bot yuborgan so‘rovnoma javoblari keladi; kanal anonim polli identifikatsiya uchun mos emas [M5] |
| X / Twitter | Postdagi manbali havola; n8n tayyor post matni | X poll API umumiy variant ovozlarini beradi; kirish/tarif tekshiriladi [M6] |
| TikTok | Video va profil havolasi; ekranda QR yoki qisqa URL | Research API hudud va tashkilot talabiga bog‘liq; O‘zbekiston loyihasi uchun kirish kafolatlanmaydi [M7] |
| YouTube | Video tavsifi, mos joyda havola yoki QR | Data API hujjatlarida Community poll uchun tayyor ovoz endpointi aniqlanmadi [M8] |
| Instagram | Bio/Story havolasi, QR va tayyor post matni | Story poll javoblarini umumiy API bilan to‘liq olish MVP sharti emas; alohida ruxsat sinovi kerak |

Har bir kanal uchun alohida campaign_id va source belgisi yaratiladi: twitter, tiktok, youtube, instagram, telegram, website. Havola bosilishi ovoz hisoblanmaydi. source so‘rovnoma tashrifining kelib chiqishi bo‘lib, ovoz berilgan texnik kanal alohida saqlanadi.

Minimal reja barcha akkauntlarda postni avtomatik chiqarishga tayanmaydi. n8n post, URL va jadval tayyorlaydi; moderator platformadagi kerakli joyga joylaydi. Rasmiy posting API ruxsati mavjud bo‘lsa shu kanal uchun avtomatik nashr alohida yoqiladi.

Barcha qonuniy olingan natijalar bazada saqlanadi. API yopiq kanalning ichki javoblari moderator tomonidan dalil havolasi bilan umumiy sonlar sifatida import qilinishi mumkin. Login/parol bilan yashirin scraping ishlatilmaydi.

## 4. Ovozning yagonaligi va g‘olibni hisoblash

Asosiy reyestr: kampaniya doirasida participant_key uchun bitta faol ovoz. Kampaniya yopilguncha ovozni almashtirish mumkin; eski holat auditda qoladi. PostgreSQL UNIQUE(campaign_id, participant_key) va tranzaksiya bir vaqtning o‘zida ikki ovoz yozilishini to‘xtatadi.

Saytdagi akkauntsiz qatnashuv uchun imzolangan tasodifiy token beriladi. Bu qurilma/sessiya darajasida yagonalikni beradi, inson darajasida mutlaq kafolat bermaydi. Yakuniy reyting uchun tasdiqlangan ishtirokchi hisobi yoki ota-ona/ta’lim muassasasi bergan token taklif qilinadi. Bepul umumiy kirish saqlanadi.

Telegram akkaunti faqat foydalanuvchi roziligi va serverda tasdiqlangan bog‘lash bilan sayt hisobiga biriktiriladi. Bog‘lanmagan hisoblar orasida bir odamni avtomatik tanish mumkin emas. Kuchli shaxsni tekshirish, SMS va biometrika minimal rejaning tarkibiga kirmaydi.

| Ovoz turi | Hisoblash qoidasi |
| --- | --- |
| Tasdiqlangan individual | Yakuniy asosiy reytingga kiradi; takrorlar chiqariladi |
| Mehmon individual | Tadqiqot statistikasi; alohida ustun, cheklovi ko‘rsatiladi |
| Tashqi umumiy natija | ExternalPollSnapshot; identifikatsiyasiz, alohida diagramma |
| Shubhali / bekor qilingan | Auditda saqlanadi, haqiqiy ovozga kiritilmaydi |

Formula: V(c) = c variantiga tegishli faol va haqiqiy tasdiqlangan ovozlar soni. N = barcha c bo‘yicha V(c) yig‘indisi. Foiz = 100 × V(c)/N; N=0 bo‘lsa 0. G‘olib = eng katta V(c) olgan variant. Barcha variantlar teng vaznda sanaladi; “hech biri” ulushi qo‘shimcha ko‘rsatiladi.

Taklif etilgan minimal chegara: 100 haqiqiy ovoz va kamida 7 kun. Chegaraga yetmasa “dastlabki natija”. Tenglikda g‘olib belgilanmaydi, teng variantlar bilan ikkinchi tur ochiladi. Ochiq vaqtdagi sonlar “oraliq”, yopilgandan keyingi sonlar versiyalangan “yakuniy” holatda bo‘ladi.

Tashqi anonim natijalar barcha platformalarda takror ovoz berish ehtimoli sababli tasdiqlangan reytingga qo‘shilmaydi. Agar buyurtmachi ularni umumiy ommaboplik indeksiga qo‘shsa, bu alohida, takrorlari tekshirilmagan indeks nomi bilan ko‘rsatiladi.

## 5. n8n avtomatlashtirish talablari

| Workflow | Trigger va bajariladigan ish |
| --- | --- |
| WF-01: kampaniya tayyorlash | Admin tasdiqlashi → API’dan so‘z/variantlar → post matni va manbali URL → moderatorga ko‘rib chiqish |
| WF-02: tarqatish | Jadval → ruxsat berilgan kanal API’si yoki moderator topshirig‘i → post_id va nashr holatini API’ga yozish |
| WF-03: Telegram javobi | Webhook → secret tekshirish → update_id bo‘yicha takrorni aniqlash → poll_id/option mapping → votes API |
| WF-04: tashqi natija | API mavjud kanal uchun jadval → umumiy natija snapshoti → API’ga idempotent upsert |
| WF-05: yopish | Server vaqti bo‘yicha muddat → Django tranzaksiyada yopadi → g‘olib va natija versiyasi → n8n e’lon matni |
| WF-06: AI yordamchi | Moderator so‘rovi → shaxsiy ma’lumotsiz matn → AI qoralama → inson tasdig‘i |
| WF-07: kuzatish | Xato yoki kunlik trigger → tizim holati/backup hisobotini mas’ul admin chatiga yuborish |

Django — ovozlar va g‘olib uchun yagona haqiqat manbai. n8n bazaga cheklanmagan to‘g‘ridan-to‘g‘ri SQL yozmaydi; tor vakolatli ichki API orqali ishlaydi. Saytdagi ovoz n8n ishdan chiqsa ham server bazasida saqlanadi. Yopish vazifasi n8n yo‘q bo‘lsa ham backend rejalashtiruvchisi bilan bajariladi.

Yetkazib berish: platforma_id + event_id idempotency kaliti; 3 marta kechiktirilgan qayta urinish; so‘ng xato navbati va admin ogohlantirishi. PollAnswer ovoz almashtirish yoki qaytarib olishni ham hisobga oladi. Agregat snapshotlar eski son ustiga yangilanadi, har safar qo‘shilmaydi.

n8n Community litsenziya xarajati $0, server xarajati alohida [M4]. Bitta mas’ul texnik operator; litsenziyadagi mavjud bo‘lmagan SSO va ko‘p foydalanuvchili workflow sharingga talab qo‘yilmaydi. n8n interfeysi jamoatchilikka xizmat sifatida sotilmaydi; litsenziya shartlari deploy oldidan tekshiriladi.

Kichik serverda AI vazifalari ketma-ket yoki past parallelizmda ishlaydi. Katta fayl/video n8n operativ xotirasida qayta ishlanmaydi. Bajarilish loglari minimallashtiriladi; saqlash va tozalash muddati konfiguratsiyada beriladi.

## 6. Yoshga mos kontent va umumiy foydalanish

| Yosh rejimi | Kontent va imkoniyatlar |
| --- | --- |
| 0–6 yosh | Katta rasm, qisqa jumla, tekshirilgan inson ovozi, moslashtirish o‘yini; akkauntsiz ko‘rish; mustaqil ommaviy ovoz va erkin chat yo‘q |
| 7–12 yosh | Sodda izoh, o‘qish mashqlari, 2–3 variantli o‘quv savoli; ota-ona/ta’lim muassasasi nazoratidagi ishtirok |
| 13–17 yosh | Tarixiy kontekst, manbali so‘zlar, nazoratli taklif; shaxsiy ma’lumot ishlovi uchun vakil roziligi |
| 18+ | To‘liq korpus, ilmiy manbalar, ochiq kampaniyalar va tadqiqot vositalari |
| Yosh ko‘rsatilmagan | Hamma uchun xavfsiz kontent; shaxsiy tavsiyalar va identifikatsiyali bolalar qatnashuvi yoqilmaydi |

Yosh aniq tug‘ilgan sana o‘rniga guruh bilan belgilanadi. Oddiy tanlov yoshni tasdiqlash usuli emas; bu kontent rejimi. Bolalar akkaunti uchun qonuniy vakilning elektron roziligi va amal qilish sanasi qayd etiladi; oddiy tasdiq katagi yakka o‘zi vakil shaxsini tekshirish o‘rnini bosmaydi [M9].

7 yoshdan kichik bolaning o‘quv mashqi asosiy g‘olib ovoziga qo‘shilmaydi. Voyaga yetmaganlarning tadqiqot ishtiroki alohida guruhda hisobot qilinadi. Ota-onaning o‘z ovozi bola ovozi sifatida ko‘rsatilmaydi. Shaxsiy bola ma’lumotlari ochiq reyting yoki eksportda chiqmaydi.

Har bir material age_min, age_max, difficulty, content_type va review_status bilan belgilanadi. AI yaratgan bolalar matni ekspert/moderator tasdig‘isiz chiqmaydi. Bolalar rejimida tashqi ijtimoiy tarmoq embedlari, maqsadli reklama, shaxsiy xabar va erkin AI chat o‘chiriladi.

Korpusdan bepul foydalanish uchun ro‘yxatdan o‘tish shart emas. Audio avtomatik chalishsiz; tasvirlar alt matnli; o‘qish tezligi va shrift kattaligi moslanadi. Voyaga yetmaganlarga tashqi platformalarda akkaunt ochishni majburlash yoki platforma yosh qoidalarini chetlab o‘tish talab etilmaydi.

## 7. Korpus, so‘z kartochkasi va statistikalar

| Modul | Majburiy funksiyalar |
| --- | --- |
| Yodgorlik | Nomi, sana, yozuv turi, joy, manba, asl matn, transliteratsiya, tarjima, bibliografiya |
| Tarixiy so‘z | Lemma, yozilish variantlari, davr, yodgorlik/qator havolasi, ma’no va ekspert |
| Zamonaviy muqobil | Variant, izoh, kelib chiqish, ishlatilish namunasi, tasdiqlash holati |
| So‘rovnoma | Savol, ma’no konteksti, variantlar, muddat, kanal va hisoblash metodologiyasi |
| Natijalar | Haqiqiy ovoz, foiz, g‘olib, yosh guruhi va kelish manbasi bo‘yicha taqsimot |
| Eksport | CSV/JSON; shaxsiy maydonlarsiz ochiq statistika, admin uchun ruxsatli batafsil eksport |

Statistika sahifasi kampaniya, davr, tarixiy so‘z, muqobil, yosh guruhi va source bo‘yicha filtrlanadi. “Tasdiqlangan ovoz”, “mehmon ovozi”, “tashqi umumiy natija”, “bekor qilingan” sonlari alohida ko‘rsatiladi. Natijalar bazada turadi; faqat AI xulosasi yoki ijtimoiy platforma havolasi saqlash yetarli emas.

Manba bo‘yicha kelishlar, real ovozlar va foydalanuvchilar soni turli ko‘rsatkichdir. Bir so‘rovnomaning turli tashqi snapshotlari ustma-ust yig‘ilmaydi. Public statistika oxirgi sinxronlash vaqti hamda metodologiyani ko‘rsatadi.

Bolalar va kam qatnashgan guruhlarning ommaviy kesimlari qayta tanib olishning oldini olish uchun birlashtiriladi; taklif etilgan ko‘rsatish chegarasi kamida 10 ishtirokchi. Ma’lumotni yashirish haqiqiy umumiy ovoz hisobini o‘zgartirmaydi.

Natija o‘zgarsa previous_result_id, sababi, kim tasdiqlagani va vaqt saqlanadi. Admin ovozlarni yashirin almashtira olmaydi; bekor qilish audit bilan bajariladi. Tekshirilmagan AI talqini yoki demo parcha to‘liq ilmiy matn deb nomlanmaydi.

## 8. Ma’lumotlar modeli va saqlash

| Obyekt | Asosiy maydonlar |
| --- | --- |
| HistoricalWord | id, lemma, script_form, transliteration, period, meaning, monument_id, line_reference, source_id, reviewed_by |
| Candidate | id, historical_word_id, modern_word, definition, rationale, examples, approval_status |
| Campaign | id, slug, direction, question, opens_at, closes_at, status, min_votes, result_policy_version |
| CampaignCandidate | campaign_id, candidate_id, display_order; ovoz boshlanganidan keyin tarkib o‘zgarmaydi |
| Participant | id, pseudonymous_key, age_group, verification_level, linked_identity_id, consent_id |
| Vote | campaign_id, participant_key, candidate_id, channel, source, status, cast_at, updated_at |
| ExternalPollSnapshot | campaign_id, platform, external_poll_id, option_counts, fetched_at, evidence, checksum |
| AgeContent | id, age_group, difficulty, content_type, text/media, review_status, version |
| Consent / Audit / SyncEvent | Rozilik versiyasi; actor/action/time; event_id/status/attempts/error |
| ResultVersion | campaign_id, candidate_counts, winner_id, total_valid, finalized_at, rule_version |

MVPda alohida vektor baza talab qilinmaydi. PostgreSQL hisoblash uchun indekslar va tranzaksiyalarni ta’minlaydi. n8n uchun alohida baza/schema va foydalanuvchi; public API n8n credentiallariga kira olmaydi.

Retention taklifi: kampaniya natijalari va shaxssiz ilmiy statistika uzoq muddat; webhook xato loglari 30 kun; xom texnik payloadlar eng qisqa zarur muddatda, standart 30 kun. Rozilik, foydalanuvchi ma’lumotlari va ovoz bog‘lanishi uchun muddat maxfiylik siyosatida alohida tasdiqlanadi. Pseudonim yoki xeshni avtomatik “anonim” deb hisoblash mumkin emas.

Backup: har kuni PostgreSQL dump, media va konfiguratsiya nusxasi; n8n credentiallarini ochish uchun encryption key ham xavfsiz saqlanadi. Kamida serverdan tashqarida bitta shifrlangan nusxa; oyiga bir tiklash sinovi. Bitta serverdagi ikkinchi papka to‘liq backup emas.

## 9. API va administrator paneli

| API (taklif) | Vazifa va tekshiruv |
| --- | --- |
| GET /api/v2/words/ | Qidiruv, davr, yozuv, yosh va ma’no filtrlari |
| GET /api/v2/polls/{slug}/ | Variantlar, muddat, holat va ovoz siyosati |
| POST /api/v2/polls/{id}/votes/ | Serverda ishtirokchi/rozilik, kampaniya holati, variant va limit tekshiruvi |
| GET /api/v2/polls/{id}/results/ | Public, shaxsiy identifikatorsiz statistikalar |
| POST /api/v2/internal/events/ | n8n tor vakolatli integratsiyasi, idempotency va imzo |
| POST /api/v2/internal/snapshots/ | Tashqi umumiy natijani almashtirib saqlash |
| POST /api/v2/polls/{id}/finalize/ | Faqat moderator/admin; serverda tranzaksiyali yopish |
| GET /api/v2/age-content/ | Faqat tasdiqlangan va tanlangan rejimga mos kontent |

API URLlari spetsifikatsiya taklifi, mavjud endpointlarga zid bo‘lmasdan amalga oshiriladi. Vaqtlar UTC saqlanadi, foydalanuvchiga Asia/Tashkent ko‘rsatiladi. Yopilish chegarasi: closes_at vaqtidan boshlab yangi ovoz qabul qilinmaydi; frontend soati hal qiluvchi emas.

Admin rollari: administrator — hisoblar va infra; lingvist — ma’no, manba va variant; moderator — kampaniya, bolalar kontenti va shubhali ovoz; analitik — shaxsiy ma’lumotsiz hisobot. Rol huquqlari Django orqali bajariladi, n8n Community RBAC imkoniyatiga tayanilmaydi.

Panelda kampaniya qoralama/tasdiqlangan/faol/yopilgan/yakunlangan holatlari, sinxronlash xatolari, tashqi import dalili, audit tarixi va AI xarajati chiqadi. API xatosi foydalanuvchiga tushunarli xabar va xavfsiz qayta urinish bilan ko‘rsatiladi; ovozni qayta yuborish yangi ovoz yaratmaydi.

Tashqi eventdagi campaign_id yoki candidate_id frontenddan kelgani uchun avtomatik ishonchli deb olinmaydi. Platformadagi option_id ↔ candidate_id mosligi admin tasdiqlagan mapping bilan tekshiriladi.

## 10. Dizayn, ommaboplik va xavfsizlik

Dizayn: mavjud tarixiy ruhni saqlagan, kam bezakli va matni o‘qiladigan interfeys. Bosh sahifa — “Korpusni o‘rganish”, “Muqobilga ovoz berish”, “Bolalar uchun” uch aniq yo‘nalish. Har bir so‘z uchun ulashiladigan barqaror URL va ijtimoiy tarmoq preview kartasi.

Moslashuvchanlik: 320 px telefondan desktopgacha; gorizontal chiqib ketishsiz. Klaviatura bilan boshqarish, modal fokusini ushlab turish, kontrast, rasm alt matni, harakatni kamaytirish sozlamasi. O‘zbekcha asosiy; mavjud rus, ingliz va turk interfeyslarini buzmaslik. Yoshga mos asosiy materiallar MVPda o‘zbek tilida.

Ommaboplik ishlari: haftalik “bir so‘z — bir savol” kampaniyasi; o‘qituvchi uchun ulashish kartasi; maktab/OTM bilan hamkorlik; QR; qisqa havola; sitemap, canonical va Open Graph. Marketing/ijtimoiy post yozish mehnati alohida smetada ko‘rsatiladi. Ommaboplik yoki muayyan trafik hajmi kafolat emas.

Himoya: HTTPS, admin uchun kuchli autentifikatsiya, serverda ruxsat, CSRF va XSS himoyasi, upload tekshiruvi, webhook secret/HMAC, tor vakolatli API token, anti-spam va tezlik cheklovi. Parol va tokenlar repozitoriyga, public logga yoki Word hujjatiga kiritilmaydi.

IP bir odam degani emas: maktab yoki oilada bitta IP bo‘lishi mumkin. IP cheklovi faqat qo‘shimcha signal; asosiy takror nazorati participant_key bilan. Doimiy device fingerprint va biometrik identifikatsiya qo‘llanmaydi.

Huquqiy talab: voyaga yetmaganlar ma’lumotiga qonuniy vakil roziligi; minimal ma’lumot va o‘chirish jarayoni. Xorijiy saqlash uchun amaldagi 27¹-modda shartlari tekshiriladi; qonun ayrim toifalarni mahalliy saqlashni talab qiladi. Bu loyiha biometrik/genetik ma’lumot yig‘maydi. AIga ismlar, Telegram ID, IP, bola profili va rozilik ma’lumoti yuborilmaydi [M9].

## 11. Unumdorlik va qabul qilish mezonlari

MVP yuklama taxmini: oyiga 10 000 tashrif, 10 000 ovoz/event, 100 faol/yopiq kampaniya, 1 000 AI vazifa. Serverda og‘ir video ishlovi yo‘q. Boshlang‘ich yuklama testi: 20 bir vaqtdagi foydalanuvchi; ko‘rsatkichlar shu sharoitda o‘lchanadi, cheksiz o‘sish va’dasi berilmaydi.

| ID | Qabul testi |
| --- | --- |
| AC-01 | Bir participantning takroriy va parallel ovozi bitta faol yozuvga tushadi; almashtirish to‘g‘ri hisoblanadi |
| AC-02 | Bir webhook ikki marta kelsa natija oshmaydi; bekor qilingan Telegram ovozi chiqariladi |
| AC-03 | Sayt, Telegram va tashqi snapshotlar bitta bazada turadi; statistikadagi alohida sonlar mos |
| AC-04 | Yopilgan kampaniya ovoz qabul qilmaydi; tenglik/0 ovoz/minimal chegara to‘g‘ri holat beradi |
| AC-05 | Eng ko‘p haqiqiy ovozli variant korpus kartochkasida natija versiyasi bilan belgilanadi |
| AC-06 | 0–6 rejimida kattalar kontenti, erkin chat va tashqi embed chiqmaydi |
| AC-07 | Tasdiqlanmagan bolalar kontenti va shaxsiy ma’lumot public API/eksportda ko‘rinmaydi |
| AC-08 | 320 px ekranda va klaviaturada asosiy vazifalar bajariladi |
| AC-09 | n8n ishlamasa sayt ovozi yo‘qolmaydi; tiklanganda navbat xavfsiz qayta ishlanadi |
| AC-10 | Backupdan baza va media tiklanadi; g‘olib va ovozlar oldingi hisobot bilan mos |

Sifat maqsadlari: oddiy ovoz API p95 ≤ 1 soniya, statistik API p95 ≤ 2 soniya; frontend asosiy kontenti odatiy mobil tarmoqda ≤ 3 soniyada ko‘rinishi maqsad qilinadi. Xizmat monitoringi bor, MVP uchun kafolatlangan 99,9% SLA sotib olinmaydi.

Tiklash maqsadlari: kundalik backup bilan RPO ≤ 24 soat, tekshirilgan nusxa va mas’ul operator mavjudligida RTO ≤ 4 soat. Yakuniy topshirishda avtomatik test, qo‘lda qabul ssenariylari va o‘lchangan yuklama hisobotlari beriladi.

## 12. Ish bosqichlari va mehnat smetasi

| Bosqich | Soat | Natija |
| --- | --- | --- |
| 1. Talab va ma’lumot dizayni | 16 | Qabul mezonlari, so‘z va ovoz modeli |
| 2. Backend so‘rovnoma/statistika | 40 | API, yagonalik, yopish, g‘olib va eksport |
| 3. Frontend va responsive dizayn | 28 | So‘z/so‘rovnoma/natija sahifalari |
| 4. n8n + Telegram + source havolalar | 24 | 7 workflow, bot mapping va xato nazorati |
| 5. Yosh rejimlari va rozilik | 24 | Bolalar kontenti filtri, vakil jarayoni |
| 6. Hosting, backup, deployment | 12 | Docker, HTTPS, monitoring va tiklash |
| 7. QA, yuklama, regressiya | 36 | Qabul ssenariylari va xavfsizlik tekshiruvi |
| 8. Seed kontent va topshirish | 20 | Kelishilgan tayyor material importi, yo‘riqnoma |
| Jami | 200 | Taklif etilgan MVP hajmi |

Minimal mehnat hisobi: 200 soat × 50 000 so‘m/soat = 10 000 000 so‘m. Bu rejalashtirish uchun muallif bahosi; pudratchi tarifi rasmiy manbadan olingan yoki buyurtmachiga taklif qilingan narx deb ko‘rsatilmaydi. Mavjud kod qayta ishlatilishi shart.

Taxminiy muddat: 6 hafta. 1-hafta — talab/model; 2–3-hafta — API va frontend; 4-hafta — n8n/bot; 5-hafta — yosh rejimi/seed kontent; 6-hafta — test, hosting va topshirish. Bir mutaxassisning 200 soatlik ishlab chiqishi va buyurtmachi ko‘rib chiqish tezligiga bog‘liq.

Lingvist/pedagogning ilmiy tahriri bu 200 soatga to‘liq kiritilmagan. Misol rezerv: 20 soat × 50 000 = 1 000 000 so‘m; support: 4 soat/oy × 50 000 = 200 000 so‘m/oy. Ikkalasi ham taxminiy mehnat bahosi. Buyurtmachi bu ishlarni o‘zi bajarsa tashqi to‘lov $0, lekin mehnat yo‘q degani emas.

## 13. AI tokenlari: tarif va aniq hisoblash

Minimal yordamchi model: GPT-4o mini. Rasmiy tarif: 1 000 000 input token uchun $0,15; 1 000 000 output token uchun $0,60 [M3]. Tarif tekshirildi: 12.10.2026. Model arzon qoralama/tasniflash uchun tanlangan; tarixiy til bo‘yicha ilmiy ishonchlilik kafolatlanmaydi.

AI vazifalari: tasdiqlangan manbadan sodda izoh qoralamasi, yosh guruhiga matn moslash, variant takliflari va moderatorga hisobot. Ovoz saqlash, foiz va g‘olibni hisoblash AI tokensiz bajariladi. Har bir bir xil vazifa natijasi keshlanadi; foydalanuvchi sahifani ochgani uchun AI qayta chaqirilmaydi.

| Oyiga AI vazifa | Input / output token | AI USD | AI so‘m |
| --- | --- | --- | --- |
| 100 | 150 000 / 50 000 | $0,0525 | 624,64 |
| 1 000 — asosiy taxmin | 1 500 000 / 500 000 | $0,5250 | 6 246,40 |
| 10 000 | 15 000 000 / 5 000 000 | $5,2500 | 62 463,98 |

1 vazifa uchun taxmin: 1 500 input + 500 output token. 1 000 vazifa formulasi: (1 500 000 / 1 000 000 × $0,15) + (500 000 / 1 000 000 × $0,60) = $0,225 + $0,300 = $0,525. So‘m: $0,525 × 11 897,90 = 6 246,3975 ≈ 6 246,40 so‘m.

Bir vazifa = $0,000525 ≈ 6,2464 so‘m. Token — so‘z bilan bir xil emas; uzun manba, qayta urinish va ko‘p tilli matnlar bu taxminni oshirishi mumkin. Ilova real API usage orqali input/output va jami xarajatni qayd etadi.

Budjet reja: oyiga ko‘pi bilan $5 = 59 489,50 so‘m. Bu majburiy oylik obuna yoki aniq sarf emas, xarajat chegarasi/zaxira. Hisobda to‘lov yoki balans to‘ldirish minimumi alohida bo‘lishi mumkin. $5 chegarada asosiy taxmin bo‘yicha taxminan 9 523 vazifa; 10 000 vazifa uchun limit oshiriladi.

Ilova/n8n o‘zida limitni tekshiradi; 80% sarfda ogohlantirish, limitda AI vazifalari to‘xtaydi, ovoz va katalog davom etadi. ChatGPT obunasi API token to‘lovining o‘rnini bosmaydi. Audio/video/rasm generatsiyasi, embedding, OCR va fine-tuning bu hisobga kiritilmagan.

## 14. Hosting va domen: ikkita tejamkor variant

| Xarajat | A: xorijiy minimal | B: O‘zbekistonda |
| --- | --- | --- |
| Server | DigitalOcean Basic: 1 vCPU, 2 GiB RAM, 50 GiB SSD [M2] | aHOST VDS Cloud 100: 2 vCPU, 2 GB RAM, 100 GB SSD [M10] |
| Server / oy | $12 = 142 774,80 so‘m | 320 000,00 so‘m |
| Server tarkibi | Django + static React + PostgreSQL + n8n bir VPSda | Xuddi shu xizmatlar bir mahalliy VPSda |
| n8n / PostgreSQL litsenziyasi | $0; hisoblash/xotira server narxiga kiradi | $0; alohida boshqariladigan DB xarid qilinmaydi |
| .uz domen / yil | 27 000,00 so‘m; odatiy bo‘sh domen [M10] | 27 000,00 so‘m; ayni registrar |
| SSL / DNS | $0 — bepul HTTPS va DNS | $0 — bepul HTTPS va DNS |
| Backup boshlang‘ich sharti | Buyurtmachining mavjud xavfsiz qurilmasiga shifrlangan nusxa | Xuddi shu; serverdan tashqarida saqlanadi |

A variant — xarajat bo‘yicha arzonroq. Xorijda saqlashga tegishli huquqiy shartlar hamda provayder shartnomasi bajarilgani hujjatlashtirilgach tanlanadi. Rozilik katagi yoki ID xeshi yakka o‘zi bu shartlarni bajardi degani emas. B variant — mahalliy saqlashni tanlagan loyiha uchun muqobil [M9].

2 GB RAM faqat kichik MVP uchun muhandislik taxmini: n8n past parallelizm, kichik payload, qat’iy log pruning, kam worker. Ishga tushirishdan oldin yuklama testi shart. Yetmasa 4 GB: DigitalOcean $24/oy yoki aHOST Cloud 200 — 590 000 so‘m/oy.

Ma’lumotlar bazasi alohida xizmatga chiqarilmagani uchun server ishdan chiqishi butun tizimga ta’sir qiladi. Doimiy katta trafikda server/DB ajratiladi. Bepul Render uyqu rejimi va bepul baza cheklovlari sababli yakuniy tizimning barqaror saqlashi uchun smeta asosi sifatida olinmagan.

Domen nomi: masalan, turkiykorpus.uz yoki turkiymeros.uz — faqat taklif, bandligi tekshirilmagan. Premium/auksion domenlar 27 000 so‘mlik narxga kirmaydi. Domen uzaytirishi ham rasmiy sahifada 27 000 so‘m/yil ko‘rsatilgan [M10].

## 15. Oylik, yillik va boshlash budjeti

Kurs: 12.10.2026 kuni amaldagi 1 USD = 11 897,90 UZS; CBU API yozuvi sanasi 10.10.2026 [M1]. Barcha USD hisoblari shu bitta kursda, kasrlar oxirida ikki xonaga yaxlitlangan. Bankning xarid kursi, komissiya va soliqlari quyidagi bazaviy jadvalga qo‘shilmagan.

| Hisob | A: xorijiy VPS | B: mahalliy VPS |
| --- | --- | --- |
| Hosting / oy | 142 774,80 | 320 000,00 |
| AI kutilgan sarf / oy | 6 246,40 | 6 246,40 |
| Domen oylik ulushi (27 000 / 12) | 2 250,00 | 2 250,00 |
| Kutilgan oylik sarf | 151 271,20 | 328 496,40 |
| AI $5 zaxirali oylik budjet | 204 514,30 | 381 739,50 |
| Kutilgan yillik sarf | 1 815 254,37 | 3 941 956,77 |
| AI $5/oy budjetli bir yil | 2 454 171,60 | 4 580 874,00 |
| Boshlash: 1 oy server + domen + $5 AI | 229 264,30 | 406 489,50 |
| MVP ishlab chiqish + 1 yil budjet | 12 454 171,60 | 14 580 874,00 |

A oylik budjet formulasi: ($12 + $5) × 11 897,90 + 27 000/12 = 204 514,30 so‘m. A yil: ($12 + $5) × 12 × 11 897,90 + 27 000 = 2 454 171,60 so‘m. B yil: 320 000 × 12 + $5 × 12 × 11 897,90 + 27 000 = 4 580 874,00 so‘m.

“Kutilgan sarf” 1 000 AI vazifa/oy taxminida $0,525 sarflanishidir. “Budjet” $5/oy zaxira ajratadi. Sarflanmagan AI balansini har oy xarajat qilib ko‘rsatish noto‘g‘ri; real invoice va usage alohida kuzatiladi. Boshlash jadvalida domen to‘liq yil uchun bir marta to‘lanadi; oylik ulush yana qo‘shilmaydi.

20% rejalashtirish rezervi bilan yillik infra budjet: A — 2 945 005,92 so‘m; B — 5 497 048,80 so‘m. Rezerv tarif emas, kurs o‘zgarishi/komissiya/soliq/noaniq sarflar uchun. Pudratchi va provayder hisobvarag‘idagi QQS hamda bank haqiqiy komissiyasi bo‘yicha to‘lovdan oldin yakuniy summa yangilanadi.

## 16. Qo‘shimcha xarajatlar va nol to‘lov shartlari

| Band | Minimal reja | Pullik holat / cheklov |
| --- | --- | --- |
| Serverdan tashqari backup | Mavjud buyurtmachi qurilmasi: $0 qo‘shimcha to‘lov | A server haftalik backupi uchun server narxining 20% rezervi = $2,40/oy; B alohida Cloud 10 nusxa serveri 125 000 so‘m/oy [M2,M10] |
| Jamoat media fayllari | VPS diski; kichik fayllar | R2 Standard 10 GB va belgilangan operatsiyalar doirasida $0; shaxsiy ma’lumot/backup joylashuvi alohida baholanadi [M11] |
| Telegram bot va organic havola | $0 platforma obunasi | SMS, pullik email, reklama yoki pullik API kirmaydi |
| X/Meta/TikTok maxsus API | MVPda xarid qilinmaydi | Kirish/tarif aniqlangach alohida smeta; $0 deb va’da berilmaydi |
| Bola audio/rasm kontenti | Huquqi bor tayyor material yoki buyurtmachi tayyorlaydi | Diktor, rassom, AI audio/video/rasm xizmatlari alohida |
| Moderatsiya va lingvist | Buyurtmachi mas’ul xodimi | 20 soat × 50 000 = 1 000 000 so‘m bir martalik taxminiy rezerv |
| Support | Buyurtmachi administratorining mehnati | 4 soat × 50 000 = 200 000 so‘m/oy taxminiy |
| Marketing/reklama | Organic postlarni buyurtmachi chiqaradi | Pullik reklama budjeti buyurtmachi tomonidan belgilanadi |

A server uchun haftalik backup $2,40 qo‘shilsa: $19,40 × kurs + 2 250 = 233 069,26 so‘m/oy; yil 2 796 831,12 so‘m. Bu DigitalOcean 20% haftalik backup rejasi tasdiqlanganda; kunlik backup tarifi boshqacha bo‘lishi mumkin. B alohida mahalliy backup VPS bilan: 506 739,50 so‘m/oy; yil 6 080 874,00 so‘m.

Mavjud backup qurilmasi yoki mutaxassis vaqtini $0 deb hisoblash yangi xarid/haq yo‘qligini anglatadi; elektr, internet, saqlash va mehnat haqiqiy resursdir. Ular yo‘q bo‘lsa shu shartli minimal reja tayyor production xarajati deb qabul qilinmaydi.

Misol: ishlab chiqish 10 000 000 + ekspert 1 000 000 + support 2 400 000/yil + bazaviy yillik infra. A jami 15 854 171,60 so‘m; B jami 17 980 874,00 so‘m. Pullik backup, reklama, soliq va bank xarajati kiritilmagan. Bular rasmiy tijorat taklifi emas, ochiq taxminli rejalashtirish hisobidir.

## 17. Ishga tushirish va qarorlar

Tavsiya: avval saytning yagona so‘rovnomasi + Telegram bot + barcha tarmoqlardagi manbali havolalar. Shu usul arzon, javobni to‘g‘ridan-to‘g‘ri saqlaydi va barcha kanallar uchun bir xil variantlarni ishlatadi.

1. Ma’no yo‘nalishini va yakuniy ovozga kiradigan ishtirokchilar siyosatini tasdiqlash. 2. Ekspert bilan 50 so‘z va muqobillarni tayyorlash. 3. Domen bandligini tekshirish. 4. Xorijiy yoki mahalliy hosting joylashuvi va maxfiylik asosini belgilash. 5. n8n, bot va PostgreSQLni test muhitiga o‘rnatish.

6. Har platformada havola ishlashini va source yozilishini sinash. 7. Rozilik, bolalar rejimi, yagonalik, backup hamda API limitini tekshirish. 8. 10 kampaniya bilan pilot. 9. Testlar o‘tgach domenni productionga yo‘naltirish. 10. Birinchi yopilgan kampaniyada g‘olib, foiz va eksportni qo‘lda solishtirish.

Demoni yangilash: bazani zaxiralash → migratsiya → mavjud yodgorliklar/foydalanuvchi takliflarini saqlash → so‘z va kampaniya obyektlarini qo‘shish → smoke test → eski URLlar ishlashini tekshirish. Rollback yo‘li kod va baza migratsiyasi uchun alohida yoziladi.

Pilotda eng katta noma’lumlar: AI uchun real token sarfi; 2 GB RAM yetarliligi; xalqaro serverdan O‘zbekiston mobil tarmoqlaridagi tezlik; auditoriyaning ovozga kelish ulushi. Har biri dastlabki 2 haftada o‘lchanadi. Tarif, trafik yoki scope o‘zgarsa smeta qayta hisoblanadi.

Claude bilan avvalgi to‘liq suhbat bu hujjat uchun taqdim etilmagan. Hujjat mavjud demo kodi va ushbu chatdagi talablar asosida tuzildi. Keyin suhbat berilsa talablar orasidagi farqlar alohida versiyada qayd etiladi.

## 18. Rasmiy manbalar va tekshirilgan sanalar

Quyidagi sahifalar 12.10.2026 kuni tekshirildi. Tariflar — rasmiy provayder sahifasidan; mehnat, foydalanish hajmi va rezervlar — ushbu topshiriqning ochiq rejalashtirish taxminlari. Ahost sahifasi bevosita HTTP orqali olindi; CBU JSON yozuvi USD 11 897,90 va kurs sanasi 10.10.2026 ni qaytardi.

[M1. Markaziy bank — kurs arxivi (12.10.2026 kuni amaldagi kurs)](https://cbu.uz/uz/arkhiv-kursov-valyut/)

[M1a. CBU USD JSON — sana bo‘yicha rasmiy yozuv](https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/2026-10-12/)

[M2. DigitalOcean — Droplet tariflari va backup parametrlar](https://www.digitalocean.com/pricing/droplets)

[M3. OpenAI — GPT-4o mini modeli, input/output tariflari](https://developers.openai.com/api/docs/models/gpt-4o-mini)

[M4. n8n — self-hosted Community nashri](https://docs.n8n.io/deploy/host-n8n/community-edition-features.md)

[M4a. n8n — tarif va Community mavjudligi](https://n8n.io/pricing/)

[M5. Telegram Bot API — poll_answer va webhook](https://core.telegram.org/bots/api)

[M6. X — poll object, umumiy variant ovozlari](https://docs.x.com/x-api/fundamentals/data-dictionary)

[M7. TikTok — Research API eligibility](https://developers.tiktok.com/products/research-api/)

[M8. YouTube — Data API resurslar katalogi](https://developers.google.com/youtube/v3/docs)

[M9. LexUZ — Shaxsga doir ma’lumotlar to‘g‘risida, amaldagi tahrir](https://lex.uz/docs/-4396419)

[M10. aHOST — .uz 27 000/yil; VDS Cloud tariflari](https://www.ahost.uz)

[M11. Cloudflare — R2 tarif va bepul kvotalar](https://developers.cloudflare.com/r2/pricing/)

Instagramning poll API imkoniyati ishonchli ochilgan rasmiy sahifa bilan tasdiqlanmadi; shu sabab MVPda undan avtomatik javob olish majburiyati berilmadi. YouTube poll endpointi yo‘qligi rasmiy resurslar ro‘yxatidan chiqarilgan xulosa, kelajakda API yangilanishini inkor etmaydi.

Aniq to‘lov qiymati tanlangan region, billing soliqlari, bank kursi, domen bandligi va foydalanish hajmiga bog‘liq. Ushbu hujjat mavjud tariflar hamda yozilgan taxminlar asosida qayta hisoblanadigan smeta beradi.
