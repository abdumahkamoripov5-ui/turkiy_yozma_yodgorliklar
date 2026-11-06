# Google tarjima qoralamalari

## Maqsadi va nashr qoidasi

Integratsiya faqat ommaviy sayt interfeysi matnlarini o‘zbekchadan ru, en, tr, tg, ky, kk tillariga tarjima qilish uchun. Tarixiy bitiklar, filologik izohlar, ekspert matnlari, foydalanuvchi yuborgan materiallar va maxfiy ma’lumotlarni bu vositaga kiritmang.

Google natijasi qoralama holatida saqlanadi va ommaviy katalog API’sidan qaytmaydi. Tahririyat xodimi matnni ko‘rib chiqishi mumkin; alohida tarjima ko‘rib chiqish huquqli ekspert uni e’lon qilgandagina saytda ko‘rinadi. Manba matn keyin o‘zgarsa, oldingi tasdiq bekor qilinib, qoralama holatiga qaytadi. Admin oynasida bir so‘rovda 30 tagacha `kalit[TAB]o‘zbekcha matn` qatori berish mumkin; bir xil tarjima qayta xarajat qilmasligi uchun o‘zgarishsiz mavjud yozuvlar o‘tkazib yuboriladi.

Tojik tili Google Cloud Translation hujjatlarida tajribaviy qo‘llab-quvvatlanadi. Nashr qilishdan oldin uni alohida tekshiring.

## Google Cloud sozlamalari

1. Google Cloud loyihasini yarating yoki tanlang, Cloud Translation API’ni yoqing va billing hisobini ulang.
2. Tarjima xizmati uchun alohida service account yarating va unga faqat Cloud Translation API User rolini bering.
3. JSON service-account kalitini xavfsiz saqlang. Uni Git’ga, suhbatga yoki brauzerga yubormang.
4. Vercel Project → Settings → Environment Variables’da Production uchun quyidagilarni kiriting:
   - GOOGLE_TRANSLATE_PROJECT_ID — Google Cloud project ID.
   - GOOGLE_TRANSLATE_CREDENTIALS_JSON — service-account JSON’ning to‘liq matni; Vercel’da sensitive sifatida saqlang.
   - Ixtiyoriy GOOGLE_TRANSLATE_LOCATION — glossary ishlatilmaganda `global` bo‘lishi mumkin; glossary uchun uning bilan mos hududiy joylashuvni, masalan `us-central1`, kiriting.
   - Ixtiyoriy GOOGLE_TRANSLATE_GLOSSARY_ID — Google Cloud’dagi glossary identifikatori.
5. Environment qiymatlarini kiritgach, Production deployment’ni qayta ishga tushiring.
6. Django admin → Interfeys tarjimalari → Google orqali qoralama yaratish bo‘limini oching. Qoralama yaratuvchi xodimga add_interfacetranslation va use_google_translation huquqlarini, tarjimani e’lon qiluvchi ekspertga change_interfacetranslation va review_interfacetranslation huquqlarini bering.

Google maxfiy qiymatlarini Vercel Preview muhitiga qo‘shmang; avval alohida sınaq loyihasi va billing chegaralari bilan tekshiring.

## Xarajat va cheklov

Google Cloud Translation xarajati matn belgilariga va tanlangan tillar soniga bog‘liq. Server har xodimga soatiga ko‘pi bilan 5 ta tarjima to‘plami, har to‘plamga 6 tagacha til va har matnga 2 000 belgi ruxsat beradi. Google Cloud Console’da qo‘shimcha kunlik quota va budget alert o‘rnating. Narxlar o‘zgarishi mumkin; amaldagi narxni [Google Cloud Translation pricing](https://cloud.google.com/products/translate/pricing) sahifasidan tekshiring.

## API va ma’lumot oqimi

- POST /api/v2/translations/generate/ — staff va add_interfacetranslation hamda use_google_translation huquqlari; qoralama yaratadi.
- GET /api/v2/translations/<lang>/ — ommaga faqat tasdiqlangan tarjimalarni qaytaradi.
- Tarjima tugallanmay qolsa, natija bazaga qisman yozilmaydi.
- key i18n kaliti bo‘lsa shu kalitni ishlating; useCopy c() satri bo‘lsa o‘zbekcha manba iborani aynan kalit sifatida kiriting. Frontend tasdiqlangan matnlarni katalog API’sidan olib, statik katalogdan ustun qo‘yadi.
