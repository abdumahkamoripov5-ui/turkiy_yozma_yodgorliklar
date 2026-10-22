# Turkiy yozma yodgorliklar korpusi — texnik topshiriq loyihasi

Sana: 22.10.2026. Holat: buyurtmachi bilan aniqlashtiriladigan dastlabki loyiha.

## 1. Maqsad

Qadimgi turkiy yozma yodgorliklarni o‘rganish uchun ochiq veb-platforma yaratish. Foydalanuvchi yodgorlikni topishi, asl matn, transliteratsiya va o‘zbekcha tarjimani o‘qishi, so‘zning matnlardagi qo‘llanishini va ilmiy manbasini ko‘rishi kerak.

Auditoriya: talabalar, o‘qituvchilar, tilshunoslar, tarixchilar va keng jamoatchilik.

Mavjud loyiha demo va funksional namuna sifatida beriladi. Unda React va Django asosidagi kod mavjud. Uni davom ettirish yoki qayta ishlab chiqish shartnoma oldidan belgilanadi. Ijrochi taklifida mavjud koddan foydalanish darajasi, almashtiriladigan qismlar va ma’lumotlarni ko‘chirish ishlari aniq yozilsin. Mavjud koddagi funksiyalar tayyor va xatosiz deb qabul qilinmaydi.

## 2. Birinchi versiyaga kiradigan ishlar

| Bo‘lim | Talab |
| --- | --- |
| Bosh sahifa | Loyiha haqida qisqa ma’lumot, qidiruv, tanlangan yodgorliklar va katalogga havola. Statistik sonlar bazadan olinsin. |
| Katalog | Nom bo‘yicha qidiruv; yozuv turi, asr va kategoriya bo‘yicha birgalikda filtrlash; nom va sana bo‘yicha saralash; sahifalash. Tanlangan filtrlar URLda saqlansin. |
| Yodgorlik sahifasi | Alohida barqaror URL; nomi, sanasi yoki sana oralig‘i, yozuv turi, tili, joyi, tavsifi, rasmlari, manbasi, asl matni, transliteratsiyasi va tarjimasi. Mavjud bo‘lmagan ma’lumotlar uchun tushunarli belgi. |
| Matnni o‘qish | Asl matn, transliteratsiya va tarjimani alohida hamda yonma-yon ko‘rish. Mobil qurilmada qulay ketma-ket ko‘rinish. Manbada satr raqamlari mavjud bo‘lsa saqlash. |
| Matn ichidan qidiruv | Asl matn, transliteratsiya va tarjimadan qidirish. Qidirilgan so‘zning chap va o‘ng kontekstini, yodgorlik nomini va tegishli sahifaga havolani ko‘rsatish. |
| Lug‘at | So‘z, transliteratsiya, o‘zbekcha ma’no, manba va foydalanish misoli. So‘zdan bog‘langan yodgorlikka o‘tish. |
| Bibliografiya | Muallif, asar nomi, yil, nashr ma’lumoti va mavjud bo‘lsa havola; tegishli yodgorlik bilan bog‘lash. |
| Taklif yuborish | Yodgorlik sahifasidan xato yoki tuzatish taklifini yuborish. Taklif moderator tasdig‘isiz ochiq kontentga ta’sir qilmasin. |
| Admin panel | Yodgorliklar, lug‘at va manbalarni yaratish, tahrirlash, qoralama saqlash, nashr qilish va nashrdan olish. Takliflarni ko‘rish, tasdiqlash yoki rad etish. |
| Xizmat sahifalari | Loyiha haqida, aloqa, materiallardan foydalanish shartlari va maxfiylik haqida sahifalar. Matnlarni buyurtmachi taqdim etadi. |

Ochiq materiallarni o‘qish uchun ro‘yxatdan o‘tish talab qilinmasin. Birinchi versiyada administrator va muharrir akkauntlari yetarli. Muharrir foydalanuvchi huquqlari va server sozlamalarini boshqara olmasin.

### Qidiruvning aniq qoidalari

- Kamida ikki belgi bilan qidirish; katta-kichik harf farq qilmasin.
- O‘zbekcha apostrofning `'`, `’`, `‘`, `ʻ`, `ʼ` shakllari qidiruvda tenglashtirilsin; asl matn bazada saqlansin.
- Qidiruv maydonlari: yodgorlik nomi, asl matn, transliteratsiya va tarjima. Lug‘at qidiruvi alohida bo‘lishi mumkin.
- Natijada qaysi maydondan topilgani ko‘rsatilsin; mos parcha ajratib ko‘rsatilsin.
- Transliteratsiyadagi maxsus ilmiy belgilar avtomatik almashtirilmasin. Morfologik va taxminiy qidiruv alohida qo‘shimcha modul hisoblanadi.

### Kontent tarkibi

Boshlang‘ich taklif: 15 yodgorlik kartochkasi, 50 lug‘at birligi va 20 bibliografik yozuv. Shulardan kamida 3 yodgorlikda buyurtmachi bergan to‘liq matn, transliteratsiya, tarjima va satr bog‘lanishlari bo‘lsin. Qolganlarida materialning to‘liqlik holati ko‘rsatilsin. Hajmlar shartnoma oldidan tasdiqlanadi.

Ilmiy matn, tarjima, rasm va ulardan foydalanish uchun zarur ruxsatlarni buyurtmachi taqdim etadi. Dasturchi ularni kelishilgan shaklda tizimga kiritadi. Yangi ilmiy tarjima tayyorlash va manbalarni ilmiy tekshirish dasturlash ishiga kirmaydi. Demo ma’lumotlari tekshirilgan ilmiy material sifatida belgilanmasin.

## 3. Alohida narxlanadigan qo‘shimcha funksiyalar

| Ustuvorlik | Funksiya | Foydasi va chegarasi |
| --- | --- | --- |
| Yuqori | Satrma-satr bog‘lash | Asl satrni tanlaganda unga mos transliteratsiya va tarjimani ajratish. Bog‘lanishlar admin orqali tahrirlanadi. |
| Yuqori | Manbaga havola va iqtibos nusxalash | Yodgorlik, nashr va sahifa/satrni ko‘rsatgan holda iqtibosni nusxalash. |
| Yuqori | Skan yoki rasmni kattalashtirish | Tasvirni yaqinlashtirish va siljitish; matn bilan yonma-yon ko‘rish. |
| O‘rta | Xarita va vaqt chizig‘i | Yodgorliklarni joylashuv va davr bo‘yicha ko‘rish. Topilgan joy va hozir saqlanadigan joy alohida maydonlarda yuritilsin; noma’lum koordinata taxmin qilib chiqarilmasin. |
| O‘rta | Taqqoslash | Ikki yodgorlikning tanlangan matn qatlamlarini yonma-yon ochish. |
| O‘rta | CSV eksport | Tanlangan ochiq yozuvlarni oldindan kelishilgan ustunlarda yuklab olish. Ilmiy TEI-XML eksporti alohida format tavsifi bilan baholanadi. |
| O‘rta | Rus va ingliz interfeysi | Menyu, tugma va xabarlar tarjimasi; ilmiy kontent tarjimasi alohida hajm. |
| Keyingi bosqich | Shaxsiy kabinet | Saqlangan yodgorliklar, qaydlar, ro‘yxatlar va akkauntni tiklash. |
| Keyingi bosqich | O‘quv bo‘limi | Buyurtmachi tayyorlagan darslar va testlar. |
| Keyingi bosqich | So‘zlarga ovoz berish | Ekspert tasdiqlagan variantlar, hisob asosida bitta ovoz, muddat va natija. Natija jamoatchilik tanlovi sifatida ko‘rsatiladi. |
| Keyingi bosqich | Telegram bot | Qidiruv natijasiga yoki kun so‘ziga sayt havolasi. Ovoz berish integratsiyasi alohida talablar bilan. |
| Keyingi bosqich | AI yoki OCR | Alohida sinov, sifat mezoni va xizmat xarajatlari bilan baholanadi; ilmiy tasdiqni almashtirmaydi. |

Ushbu jadvaldagi funksiyalar asosiy narxga avtomatik kirmaydi. Mavjud demoda bor qo‘shimcha funksiyalarni saqlash va tuzatish narxi ham alohida ko‘rsatilsin.

## 4. Dizayn va texnik talablar

- Asosiy interfeys tili — o‘zbek lotin yozuvi. Tarixiy yozuvlar va ilmiy belgilar Unicode orqali to‘g‘ri ko‘rsatilsin; tegishli shriftlar litsenziyasi bilan ulansin.
- 360, 768 va 1440 piksel kengliklarda asosiy sahifa, katalog va o‘qish oynasi tekshirilsin. Saytning umumiy sahifasida gorizontal siljish bo‘lmasin; zarur matn paneli ichida siljish mumkin.
- Klaviatura bilan foydalanish, ko‘rinadigan fokus, forma yorliqlari, rasm uchun matnli tavsif va o‘qiladigan kontrast ta’minlansin.
- Yuklanish, bo‘sh natija, server xatosi va topilmagan sahifa holatlari uchun tushunarli xabarlar bo‘lsin.
- Har bir yodgorlik uchun alohida sahifa sarlavhasi, tavsifi va ulashish metama’lumotlari; sitemap va robots sozlamalari bo‘lsin. Admin va qoralamalar indekslanmasin.
- Demo kodini davom ettirish uchun React + Django REST + PostgreSQL tavsiya etiladi. Boshqa yechim taklif qilinsa, boshqarish, ko‘chirish va xizmat xarajatlari tushuntirilsin.
- Barcha ochiq ma’lumotlar server bazasidan olinsin. Admin orqali o‘zgartirilgan matnlar yangi kod chiqarishni talab qilmasin.
- HTTPS, maxfiy sozlamalarni muhit o‘zgaruvchilarida saqlash, serverda huquqlarni tekshirish va formalar uchun so‘rov cheklovi bo‘lsin. Ochiq API ichki izoh, email va qoralamalarni qaytarmasin.
- Rasm yuklash: JPG, PNG, WebP, ko‘pi bilan 5 MB. Hujjat yuklash qo‘shilsa, faqat PDF, ko‘pi bilan 20 MB. Fayl turi serverda tekshirilsin.
- Yuklangan fayllar qayta ishga tushirish va yangi versiya chiqarishdan keyin saqlansin. Baza va media uchun kunlik zaxira nusxa va 7 kunlik saqlash sozlansin; tiklash yo‘riqnomasi berilsin.
- Qidiruv uchun taklif etilgan mezon: jami 5 million belgigacha matnli 1 000 kartochkada, 10 parallel foydalanuvchi sharoitida server javoblarining 95 foizi 2 soniyadan oshmasin. Tekshiruv serveri parametrlari shartnomada qayd etilsin; bu mezon internet va sahifa yuklanish vaqtini qamramaydi.

## 5. Ishni qabul qilish mezonlari

1. Admin yangi yodgorlik yaratadi: qoralama holatida u ochiq sahifa, qidiruv va to‘g‘ridan-to‘g‘ri API orqali ko‘rinmaydi; nashrdan keyin katalogda ochiladi.
2. Nashr qilingan matn tahrirlanganda foydalanuvchi sahifasida yangilangan ma’lumot ko‘rinadi.
3. Nomi va matndan kelishilgan misollar bilan qidirish, bir nechta filtrni birga ishlatish va filtrli URLni qayta ochish ishlaydi.
4. Apostrofning ko‘rsatilgan shakllari bir xil natija beradi; maxsus ilmiy belgilar saqlanadi.
5. Kamida uchta to‘liq namunada asl matn, transliteratsiya, tarjima va bibliografik manba to‘g‘ri ko‘rinadi.
6. Foydalanuvchi tuzatish taklifi yuboradi; moderator ko‘rib chiqmaguncha asl yozuv o‘zgarmaydi.
7. Ruxsatsiz foydalanuvchi admin amallarini sahifa yoki API orqali bajara olmaydi. Muharrir administrator huquqlarini o‘zgartira olmaydi.
8. Ko‘rsatilgan ekran kengliklarida va topshirish paytidagi Chrome, Firefox, Edge hamda mobil Safari versiyalarida asosiy jarayonlar ishlaydi.
9. Sayt server qayta ishga tushirilgandan keyin matn va rasmlarni yo‘qotmaydi. Baza va media zaxirasidan sinov muhitiga tiklash namoyish qilinadi.
10. Kod, kirish huquqlari, o‘rnatish yo‘riqnomasi va administrator qo‘llanmasi topshiriladi. Belgilangan xatolar ro‘yxati yopiladi.

## 6. Ijrochi topshiradigan natijalar

- Buyurtmachi hisobidagi repozitoriyda to‘liq manba kodi va o‘zgarishlar tarixi.
- Kelishilgan maketlar, ishlab turgan sayt va admin panel.
- Ma’lumotlar bazasi migratsiyalari, boshlang‘ich ma’lumotlar va import formati namunasi.
- Muhit sozlamalari namunasi; o‘rnatish, yangilash, zaxiralash va tiklash yo‘riqnomasi. Maxfiy kalitlar repozitoriyga yozilmasin.
- API tavsifi va administrator uchun qisqa qo‘llanma yoki video.
- Qabul mezonlari bo‘yicha tekshiruv natijalari va ishlatilgan tashqi xizmatlar ro‘yxati.
- Domen, hosting, ma’lumotlar bazasi va fayl xotirasi buyurtmachi hisobida bo‘lishi; yakunda kirish huquqlari topshirilishi.

## 7. Ish bosqichlari va tijoriy taklif

1. Mavjud demoni ko‘rish, yakuniy qamrov va ma’lumotlar tuzilmasini kelishish.
2. Bosh sahifa, katalog va yodgorlik sahifasining kompyuter hamda mobil maketlarini tasdiqlash.
3. Asosiy funksiyalar va admin panelni sinov serverida topshirish.
4. Kontent kiritish, qabul tekshiruvlari va xatolarni tuzatish.
5. Buyurtmachi hostingiga joylash va hujjatlarni topshirish.

Ijrochi har bosqichning muddati, narxi va topshirish natijasini taklifida yozsin. Asosiy ishlar, qo‘shimcha modullar, kontent kiritish, hosting/domen va keyingi texnik xizmat alohida narxlansin. Tashqi pullik xizmat zarur bo‘lsa, nomi va to‘lov modeli oldindan ko‘rsatilsin. Ushbu hujjatda bozor narxi yoki bajarish muddati kafolatlanmaydi.

Taklif etiladigan shart: qabuldan keyin 30 kalendar kun davomida kelishilgan talablarga zid dasturiy xatolarni bepul tuzatish. Yangi funksiyalar alohida kelishiladi. Muddat va kafolat shartlari shartnomada tasdiqlanadi.

## 8. Birjaga qo‘yish uchun e’lon matni

**Sarlavha:** Turkiy yozma yodgorliklar elektron korpusini ishlab chiqish / mavjud demoni rivojlantirish

Turkiy yozma yodgorliklar uchun mobil qurilmalarga mos ilmiy-ma’rifiy sayt kerak. Mavjud demo va kodi taqdim etiladi. Asosiy vazifalar: yodgorliklar katalogi, qidiruv va filtrlar, alohida yodgorlik sahifasi, asl matn–transliteratsiya–tarjima ko‘rinishi, matndan kontekstli qidiruv, lug‘at, bibliografiya, tuzatish takliflari va admin panel. Yakunda saytni hostingga joylash, boshlang‘ich kontentni kiritish, kod va yo‘riqnomalarni topshirish talab qilinadi.

Taklifda o‘xshash ishlaringiz, demo kodini davom ettirish yoki yangidan yozish bo‘yicha yondashuvingiz, bosqichlar, muddat, narx va kafolat shartlarini yozing. Qo‘shimcha modullarni alohida baholang. Batafsil talablar ushbu texnik topshiriqda berilgan.

## 9. E’lon qilishdan oldin aniqlashtiriladigan qarorlar

- Mavjud kod davom ettiriladimi yoki demo asosida yangi loyiha yaratiladimi?
- Maqsad asosiy korpusmi, ovoz berish platformasimi yoki ta’lim platformasimi?
- Boshlang‘ich kontent hajmi va uni kim taqdim etishi.
- Qo‘shimcha modullardan qaysilari birinchi shartnomaga kirishi.
- Budjet chegarasi, kerakli topshirish sanasi va hosting uchun mas’ul tomon.

Ushbu qarorlar javoblar asosida hujjatning keyingi tahririga kiritiladi. Hozirgi loyiha asosiy korpusni birinchi bosqich deb oladi; bu buyurtmachining yakuniy tasdig‘i hisoblanmaydi.
