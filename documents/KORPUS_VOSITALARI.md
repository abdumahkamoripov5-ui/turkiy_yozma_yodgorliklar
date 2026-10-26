# Korpus ish maydoni

## Foydalanuvchi jarayoni

- Bosh sahifadagi qidiruv yoki **Korpus qidiruvi** menyusi → so‘z/ibora → filtrlar → satr → surat, izoh va lug‘at.
- **Tadqiqot daftari**: so‘zlar, yodgorliklar va satrlar uchun zakladkalar; to‘plamlar; shaxsiy qaydlar; saqlangan qidiruvlar; o‘qish tarixi. Ma’lumotlar foydalanuvchi hisobiga bog‘langan va qurilmalararo olinadi. Avval brauzerga saqlangan zakladkalar bir marta ko‘chiriladi, serverdagi yangi yozuvlar ustiga yozilmaydi.
- O‘qish oynasi satr joyini saqlaydi. Bosh sahifadagi **O‘qishni davom ettirish** shu manzilga qaytaradi. Aniq satrli havola saqlangan joydan ustun turadi.

## Qidiruv

`/corpus` va oldingi `/concordance` bir xil vositani ochadi. Butun so‘z, ibora, so‘zning bir qismi yoki lemma bo‘yicha qidirish mumkin. Unicode NFC, katta-kichik harflar va apostrof variantlari asl matndagi belgilarni o‘zgartirmasdan hisobga olinadi. Asl yozuv, transliteratsiya va tarjima alohida tanlanadi.

Filtrlar: yozuv, janr, til, hudud, nashr/manba, yil oralig‘i va alohida yodgorliklar. Davri bir necha yilni qamrab olgan matnlar oraliq kesishganda olinadi. Natijalar chap/o‘ng kontekst, shakl, manba yoki yodgorlik nomi bo‘yicha saralanadi; kontekst hajmi sozlanadi. Natijalar sahifalanadi. Bir so‘rov uchun 10 000 moslik chegarasi ochiq ko‘rsatiladi.

Konkordansdan asl satrga, lug‘atga, iqtibosni nusxalashga va saqlashga o‘tish mumkin. Qidiruv qayta saqlansa bir xil filtrlar uchun nusxa yaratilmaydi.

## Ilmiy ma’lumotlar

**Lemma/morfologiya** taxminiy avtomatik tahlil emas: admin kiritgan manbali `WordForm` yozuvlari ishlatiladi. O‘zak, segmentatsiya, so‘z turkumi, grammatik belgilar va lug‘at maqolasi bog‘lanishi mavjud. Faqat tekshirilgan, nashr qilingan va tekshiruvchisi ko‘rsatilgan tahlillar chiqariladi. Tahlil kiritilmagan bo‘lsa shu holat ko‘rsatiladi. Lug‘at va tarixiy uchrashuvlar tasdiqlangan shakllar bilan kengayadi.

**Parallel o‘qish**: nashr qilingan tahririy satrlar asosiy hisoblanadi. Qatorlar soni mos keladigan avtomatik parallel ko‘rinish alohida belgilanadi; mos kelmagan ustunlar ilmiy tekshirilgan tarjima sifatida juftlanmaydi. Bunday matnlarning qidiruv natijasi yodgorlikka olib boradi, mavjud bo‘lmagan parallel satrga emas.

**Surat–satr bog‘lanishi**: satrning `facsimile_url` va foizli `image_region` hududi kiritiladi. Admin rasm ustida tortib hudud belgilashi mumkin; JSON koordinatalari avtomatik to‘ldiriladi. O‘qish oynasida shu hudud ko‘rsatiladi va kattalashtiriladi. Belgilanmagan hududlar sun’iy ravishda yaratilmaydi.

**O‘qilish variantlari**: satr, olim, nashr/sahifa, o‘qilish, tarjima, izoh va aniqlik holati bilan kiritiladi. Qoralamalar, nashr qilinmagan satrlar va tekshiruvchisiz variantlar foydalanuvchiga chiqmaydi. Adminning standart tahrir tarixi saqlanadi.

## Statistika va taqqoslash

`/frequent-words`: tanlangan korpus va matn turi uchun real tokenlar, turli shakllar, hujjatlar soni, chastota va har 10 000 so‘zga normallangan qiymat. Qisqa so‘zlar ham hisoblanadi. So‘zni jadvalda filtrlash umumiy korpus hajmini o‘zgartirmaydi. Yodgorliklar kesimidagi taqsimot ochiladi.

Yonma-yon qo‘llanishlar satr ichidagi 1–10 so‘zli chap/o‘ng oynada hisoblanadi. Jami, chap/o‘ng soni va yodgorliklar qamrovi chiqariladi. Bular kuzatilgan takrorlar; statistik ishonchlilik yoki sababiy bog‘lanish deb talqin qilinmaydi.

`/compare`: 2–3 yodgorlikni URL orqali qayta ochish/ulashish, mavjud qatlamlarni yonma-yon o‘qish, barchasida uchragan va faqat bittasida uchragan so‘z shakllarini ko‘rish. Tanlangan matnlardan qidirish, chastota olish va eksport qilish mumkin. Bu turli asarlar satrlarini avtomatik tenglashtiruvchi kritik nashr emas.

Umumiy statistika ham real nashr qilingan transliteratsiya tokenlarini sanaydi; avvalgi qo‘lda kiritilgan `word_count` qiymati ma’lumot sifatida alohida saqlanadi.

## Eksport

- Qidiruv natijalari: CSV, XLSX, JSON; manba, satr, kontekst, doimiy havola va iqtibos bilan.
- Tanlangan korpus: CSV, XLSX, JSON va TEI XML; asl matn, transliteratsiya, tarjima va tekshirilgan o‘qilish variantlari bilan.
- Shaxsiy daftar: foydalanuvchining tanlangan turi, to‘plami yoki izlashiga mos yozuvlar, CSV/JSON.

Elektron jadval formulasi sifatida talqin qilinadigan satrlar eksportda zararsizlantiriladi. Platformaning javob hajmi chegarasi sabab 4 MB dan katta eksport rad etiladi va filtrlarni toraytirish so‘raladi; korpus eksporti uchun 1000 yodgorlik chegarasi bor.

## API va ruxsatlar

Yangi yo‘llar `/api/v2/research/` ostida: `search/`, `options/`, `frequency/`, `collocations/`, `morphology/`, `variants/`, `export/`.

`/api/v2/workspace/items/` — faqat o‘z yozuvlari; `by-key/` PUT/DELETE — qayta saqlash va o‘chirish; `/api/v2/workspace/export/` — shaxsiy eksport. JWT va CSRF talabiga rioya qilgan session autentifikatsiyasi ishlaydi. Boshqa hisobning yozuvi ID orqali ham olinmaydi; shaxsiy javoblar `private, no-store` bilan beriladi. Shaxsiy qaydlar umumiy admin model ro‘yxatiga qo‘shilmagan.

Qidiruv/eksport limitlari autentifikatsiyalangan foydalanuvchi bo‘yicha ajratiladi; bir tarmoqdagi tadqiqotchilar bir-birining limitini sarflamaydi.

## Baza va tekshiruv

`0014_research_workspace_and_annotations` qo‘shimcha jadvallar va satr atributlarini yaratadi; mavjud matnlarni almashtirmaydi. Lokal baza zaxirasi `.local/before-research-workspace.sqlite3`da. Productionda yangi kod bilan birga migratsiya ham bajarilishi kerak: mavjud build skripti uchun `VERCEL_RUN_MIGRATIONS=1`. Qayta seed yoki boshlang‘ich baza importini ishlatmang.

Server testlari: `python backend/manage.py test korpus --noinput` (`DJANGO_DEBUG=True` bilan). Frontend: `npm run lint`, `npm test`, `npm run build`. Brauzerda haqiqiy mahalliy API bilan qidiruvdan qayd va eksportgacha bo‘lgan jarayon, mobil ko‘rinishlar va adminning rasm ustida hudud belgilashi tekshiriladi. Sinov ma’lumotlari productionga ko‘chirilmaydi.
