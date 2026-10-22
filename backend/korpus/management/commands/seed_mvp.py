from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from korpus.models import Book, MediaLesson, WordEntry, WordPoll, PollOption


class Command(BaseCommand):
    help = 'MVP uchun aniq belgilangan o‘quv namunalarini yaratadi; mavjud tahrirlarni almashtirmaydi.'

    def handle(self, *args, **options):
        books = [
            ('Bitiklardan boshlangan sayohat', 'forest', 'Qadimgi turkiy yozma merosga kirish', [
                ('Yozuv — xotira', 'Yozuv insonning so‘zini uzoq vaqt saqlash imkonini beradi. Toshga o‘yilgan belgi, qo‘lyozmadagi satr va bugungi elektron matn — xotirani yetkazishning turli shakllari.\n\nBu kichik qo‘llanma saytning o‘qish imkoniyatlarini ko‘rsatish uchun loyiha doirasida tayyorlangan namuna. U tarixiy yodgorlikning asl nashri yoki ilmiy tarjimasi emas.'),
                ('Uch xil o‘qish', 'Asl yozuv — manbadagi belgilar. Transliteratsiya — bir yozuv belgilarini boshqa yozuv belgilari bilan ifodalash. Tarjima esa matn mazmunini boshqa tilda berishdir.\n\nUlar bir-birini to‘ldiradi. Bir satrning ma’nosini o‘rganayotganda uning asl shakli va nashr manbasini ham tekshiring.'),
                ('Manbaga qaytish', 'Bir so‘zning ma’nosini tushunish uchun uning qaysi gapda, qaysi davrda va qaysi nashrda berilganini bilish kerak. Alohida so‘zdan ko‘ra matnning konteksti ko‘proq ma’lumot beradi.\n\nKorpusdagi manba havolasi sizni aynan shu dalilga olib borishi kerak.'),
                ('Sayohat davom etadi', 'Yodgorliklar katalogini oching. Sizni qiziqtirgan yozuv turini tanlang. Asl matn, transliteratsiya va tarjimani solishtiring. Savolingiz tug‘ilsa, manbani belgilang va o‘zingizga qayd qoldiring.\n\nHar bir tekshirilgan satr merosni tushunishga yana bir qadamdir.'),
            ]),
            ('So‘z, ma’no va zamon', 'clay', 'So‘zlarni manba va kontekst bilan o‘rganish', [
                ('So‘zning hayoti', 'Bir so‘z turli davrlarda turlicha ma’no yoki qo‘llanishga ega bo‘lishi mumkin. So‘z tarixini o‘rganishda faqat tashqi o‘xshashlikka tayanish yetarli emas.\n\nUshbu matn o‘qish oynasini namoyish qiladigan original o‘quv namunasidir.'),
                ('Misol bilan o‘rganish', 'Lug‘at yozuviga qaraganda manbani, misol gapni va qaysi tilga mansubligini ko‘ring. Ikki tildagi o‘xshash so‘zlar albatta bir xil ma’noni bildirmasligi mumkin.\n\nIlmiy izoh bilan jamoatchilik taklifini farqlash ishonchli o‘rganishning bir qismidir.'),
                ('Yangi muqobil', 'Zamonaviy tushuncha uchun so‘z taklif qilishda uning ma’nosi tushunarli, qo‘llanishi qulay va dalili ochiq bo‘lishi muhim.\n\nSaytdagi ovoz berish jamoatchilik fikrini ko‘rsatadi. U o‘z-o‘zidan tarixiy dalil yoki rasmiy til me’yori bo‘lib qolmaydi.'),
            ]),
            ('Tadqiqotchining kichik daftari', 'ink', 'Manba, iqtibos va ilmiy savol', [
                ('Savoldan boshlang', 'Yaxshi tadqiqot aniq savoldan boshlanadi: bu satr qayerda berilgan, kim o‘qigan, qaysi tarjimalari bor?\n\nBu qo‘llanma platforma uchun tayyorlangan namuna bo‘lib, alohida ilmiy nashrni almashtirmaydi.'),
                ('Iqtibosni saqlang', 'Muallif, asar nomi, nashr yili va sahifa yoki satrni qayd qiling. Qaysi tarjimadan foydalanganingizni ko‘rsating.\n\nSaytdagi iqtibos nusxalash va bibliografiya vositalari bu ma’lumotlarni yo‘qotmaslikka yordam beradi.'),
                ('Hissangizni qo‘shing', 'Xato yoki yangi manba topsangiz, tekshiriladigan dalil bilan yuboring. Ilmiy ishlar admin ko‘rigidan keyin e’lon qilinadi.\n\nTekshirish va savol berish umumiy bilimni boyitadi.'),
            ]),
        ]
        for title, style, description, pages in books:
            Book.objects.get_or_create(title=title, defaults={
                'author': 'Loyiha tahririyati', 'description': description, 'cover_style': style,
                'pages': [{'title': heading, 'text': text} for heading, text in pages],
                'source': 'Platforma uchun yozilgan o‘quv namunasi; tarixiy asl matn emas.',
                'is_sample': True, 'published': True,
            })
        word_specs = [
            ('bitik', 'Yozuv yoki yozilgan matn ma’nosini tushuntirish uchun o‘quv namunasi.', 'Bitikni manbasi bilan o‘rganamiz.'),
            ('bilim', 'Bilish va o‘rganish bilan bog‘liq tushuncha uchun o‘quv namunasi.', 'Har bir yangi so‘z bilimimizni boyitadi.'),
            ('el', 'Xalq yoki yurt tushunchasiga kirish uchun o‘quv namunasi.', 'So‘zning aniq ma’nosi matn kontekstida tekshiriladi.'),
        ]
        words = []
        for word, meaning, example in word_specs:
            entry, _ = WordEntry.objects.get_or_create(word=word, defaults={
                'meaning': meaning, 'example': example, 'source': 'O‘quv namunasi. Ilmiy nashrga bog‘lash uchun ekspert tekshiruvi zarur.',
                'published': True,
            })
            words.append(entry)
        for title, audience, series, transcript, question, choices, answer in [
            ('Belgilar ortidagi hikoya', 'children', 'Bitik izidan',
             'Tasavvur qiling: siz qadimiy yozuv topdingiz. Uni o‘qish uchun avval belgilarni, keyin so‘zlarni o‘rganasiz. Matnni tarjima bilan solishtirasiz. Bugungi topshiriq: yozuv va tarjima orasidagi farqni toping.',
             'Tarjima nimani beradi?', ['Matn ma’nosini boshqa tilda', 'Faqat toshning rasmini', 'Faqat yozilgan yilni'], 0),
            ('Bir so‘zning ikki davri', 'teens', 'So‘zlar sayohati',
             'Qadimgi matndagi so‘zni bugungi ma’nosi bilan darhol tenglashtirish mumkinmi? Avval davr, til, qo‘llanish va manbani tekshirish kerak. Bir xil yozilgan shakl ham turli kontekstda boshqa ma’noni berishi mumkin.',
             'Tarixiy so‘zni izohlashda nimaga tayanamiz?', ['Faqat ovoz berishga', 'Manba va matn kontekstiga', 'Faqat zamonaviy talaffuzga'], 1),
        ]:
            lesson, created = MediaLesson.objects.get_or_create(title=title, defaults={
                'audience': audience, 'series': series, 'description': 'So‘zlarni hikoya va kichik topshiriq orqali o‘rganing.',
                'transcript': transcript, 'quiz': {'question': question, 'options': choices, 'answer': answer,
                                                 'explanation': 'Matnning ma’nosi va manbasi muhim. Asl yozuv, transliteratsiya va tarjima turli vazifani bajaradi.'},
                'published': True, 'is_sample': True,
            })
            if created:
                lesson.words.set(words[:2])
        poll, created = WordPoll.objects.get_or_create(title='“Onlayn uchrashuv” uchun muqobil tanlaymiz', defaults={
            'context': 'Ovoz berish jarayonini sinash uchun namuna kampaniya. Quyidagi variantlar loyiha namunalari; tarixiy attestatsiya yoki rasmiy tavsiya emas.',
            'starts_at': timezone.now() - timedelta(days=1), 'ends_at': timezone.now() + timedelta(days=30),
            'published': True, 'is_sample': True,
        })
        if created:
            for word, explanation in [('Tarmoq uchrashuvi', 'Internet orqali o‘tkaziladigan uchrashuv uchun taklif.'),
                                      ('Masofaviy yig‘in', 'Bir joyda bo‘lmagan ishtirokchilar yig‘ini uchun taklif.'),
                                      ('Onlayn uchrashuv', 'Amalda ishlatiladigan shaklni saqlash taklifi.')]:
                PollOption.objects.create(poll=poll, word=word, explanation=explanation,
                                          source='Loyiha namuna varianti; ilmiy tekshiruvdan o‘tmagan.')
        self.stdout.write(self.style.SUCCESS('MVP namunalari tayyor. Video fayllari berilmagan; admin orqali yuklanadi.'))
