# Turkiy Meros: yangilangan MVP

## Foydalanuvchi yo‘li

Bosh sahifa — qisqa tanishtiruv, uch qadam va “Merosni kashf eting” tugmasi.
Oldingi bitiktoshlar sayohati `/explore` sahifasida ixtiyoriy ravishda ochiladi.
Mehmonlar uchta saralangan yodgorlik va uchta lug‘at maqolasini hisob ochmasdan
o‘qiy oladi. Ochiq tanlov API darajasida chegaralangan: filtr, sahifalash,
to‘g‘ridan-to‘g‘ri ID va so‘z uchrashuvlari orqali qolgan matnlar ochilmaydi.
Hisob ochilgach to‘liq korpus, lug‘at, tadqiqot vositalari va hamjamiyat ochiladi.
Asosiy kontent bepul.
Interfeys: o‘zbek, rus va ingliz. Tarixiy manbalar o‘z tilida qoladi.

Mehmon menyusida kashf etish va lug‘at; hisobga kirgach bosh sahifa, yodgorliklar,
lug‘at, tadqiqot vositalari, hamjamiyat va saqlanganlar ko‘rinadi.
Saqlash faqat hisobga kirgach ishlaydi; tanlangan so‘zlar ushbu brauzerda
foydalanuvchi nomi bilan alohida saqlanadi. Qurilmalararo sinxronlash ulanmagan.
Xarita, vaqt shkalasi, konkordans, CSV/JSON eksport va taklif yuborish
tadqiqot vositalarida joylashgan.

## Ilmiy ma’lumotlar

Parallel satrlar uchun manba talab qilinadi. Avtomatik satr mosligi ekspert
tekshiruvidan o‘tgan deb ko‘rsatilmaydi. Har bir satrdan havola va iqtibos ko‘chiriladi.
Havola kirishdan keyin ham kerakli yodgorlik va satrni ochadi.

Lug‘at maqolasida yozilish, talaffuz, ma’no, misol, manba, zamonaviy turkiy
muqobillar va tarixiy matnlardagi uchrashuvlar mavjud. Talaffuz yoki muqobillar
kiritilmagan bo‘lsa, taxminiy ma’lumot o‘rniga bu holat ochiq yoziladi.
Uchrashuvlar transliteratsiyadagi butun so‘z bo‘yicha topiladi; morfologik analiz yo‘q.
Admin orqali lug‘atni nashr qilish tekshiruvchi va vaqtni qayd etadi.
Ekspertlarga Django guruhlari orqali tegishli modellarni ko‘rish va tahrirlash huquqi beriladi.

## Eng sodda ovoz berish

Ovoz berish MVPda saqlandi: hisobga bir kampaniyada bitta ovoz, muddat,
natijalar va yakunlangan kampaniya g‘olibini vakolatli mutaxassis tasdiqlashi.
Natija avtomatik ilmiy haqiqat yoki rasmiy til me’yori hisoblanmaydi.

Tahririyat rejasi: kuniga ikki so‘z. Har ikki kunda bitta umumlashtiruvchi post
tayyorlash mumkin — unda oldingi ikki kunning to‘rtta so‘zi jamlanadi. Bu ikki
taklifni birlashtiruvchi ishchi talqin; avtomatik jadval joriy qilinmagan.
Administrator kampaniyalarga boshlanish va tugash vaqtlarini belgilaydi.
Admin → Ovoz berish kampaniyalari → tanlash → “Ijtimoiy tarmoq uchun post
matnlarini yuklab olish” orqali bir xil uslubdagi matnlar olinadi.
Bu amal postni tashqi tarmoqqa joylamaydi. Vizual postning referens rasmi
taqdim etilmagani uchun uning dizayniga aynan moslashtirish bajarilmagan.

## Faoliyat qaydlari

Admin panelning asosiy menyusi: yodgorliklar, lug‘at, ovoz berish va takliflar.
Foydalanuvchilar, rollar, manbalar, sayt sozlamalari va loglar “Sozlamalar va
tarix” ostida yig‘iladi; tegishli sahifaga kirilganda bu guruh o‘zi ochiladi.
Kitoblar, video darslar, ilmiy ishlar, alohida ovoz yozuvlari va JWT tokenlari
admin menyusi va yo‘llaridan chiqarilgan. Bazadagi yozuvlar saqlanadi.
Boshqaruv bosh sahifasida uchta asosiy hisoblagich, tezkor amallar, tekshiriladigan
takliflar va so‘nggi tahrirlar qolgan.

Yangi yozuv ochish uchun “+” o‘rniga “Qo‘shish” matni ishlatiladi. Tadqiqotchilar,
adabiyotlar va kalit so‘zlar oddiy satrlar bilan kiritiladi. Turkiy muqobillar
til tanlash va so‘z kiritish qatorlari orqali to‘ldiriladi; qo‘lda JSON yozish
talab qilinmaydi. Saqlash formati va ilgari kiritilgan ma’lumotlar saqlanadi.

Kirishlar mavjud kirish tarixida, autentifikatsiyalangan API amallari esa
“Foydalanuvchi faoliyati” bo‘limida saqlanadi: foydalanuvchi, HTTP usuli,
endpoint yo‘li, javob holati va vaqt. Qidiruv matni, parol, token yoki so‘rov
tanasi bu jadvalga yozilmaydi. Bu brauzerdagi har bir bosishni kuzatish tizimi emas.
Hajm oshganda saqlash muddati va arxivlash siyosatini belgilash kerak.

## Ikkinchi bosqich

Video, bolalar topshiriqlari, elektron kitobxona va ilmiy ishlarni taqriz qilish
foydalanuvchi yo‘llari va API routeridan chiqarildi. Mavjud ma’lumotlar va
ular bilan ishlovchi kod saqlandi. Telegram bot, o‘qituvchi paneli,
ijtimoiy tarmoq integratsiyasi va AI yordamchi keyingi bosqichga tegishli.

## Daromad yo‘nalishlari

Reklama, tahrirlangan lug‘atni kitob sifatida nashr qilish va pullik API —
keyingi biznes yo‘nalishlari. Reklama tarmog‘i, to‘lov, pullik tarif va API
kalitlari bu o‘zgarishda ulanmagan. Saytdagi CSV/JSON eksport hisobga kirgan
foydalanuvchilar uchun bepul qoladi. Nashr va API oldidan materiallar huquqlari,
litsenziyalar, ekspert tekshiruvi va foydalanish shartlari aniqlashtiriladi.

## Ishga tushirish

Yangi maydon va faoliyat jadvallari uchun `backend/manage.py migrate` bajariladi.
`MVPni_ochish.cmd` migratsiyalarni o‘zi bajaradi. Ishchi hostingda ham deploy
jarayonida migratsiya bajarilishi kerak. Hech qanday foydalanuvchi kontenti o‘chirilmaydi.
