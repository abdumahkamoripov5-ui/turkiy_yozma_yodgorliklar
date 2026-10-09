from django.core.management.base import BaseCommand

from korpus.models import Monument, SiteSettings

# Demo ma'lumotlar — haqiqiy yodgorliklardan qisqa parchalar bilan.
# Rasmlar Wikimedia Commons'dan (Special:FilePath barqaror havolalar).
IMG = "https://commons.wikimedia.org/wiki/Special:FilePath/"

MONUMENTS = [
    # ── Ko'ktürk (runik) tosh bitiklari ──────────────────────────────────────
    {
        "title": "Tonyuquq bitigi",
        "title_original": "𐱃𐰆𐰪𐰸𐰸",
        "year": 716, "year_end": 720,
        "location": "Mo'g'uliston, Nalayh tumani",
        "script": "koktürk", "category": "bitiglar", "language": "Ko'hna turkiy",
        "description": (
            "Ikkinchi Ko'ktürk xoqonligining davlat arbobi va sarkardasi dono To'nyuquq "
            "o'z tilidan yozdirgan yodgorlik. Ikki toshdan iborat bitikda xoqonlikning "
            "qayta tiklanishi va yurishlari hikoya qilinadi."
        ),
        "significance": (
            "O'z tilidan hikoya qilingan yagona bitik — turkiy memuar (esdalik) janrining "
            "ilk namunasi. Tili sodda, xalq maqollariga boy."
        ),
        "full_text": "𐰋𐰃𐰠𐰏𐰀 𐱃𐰆𐰪𐰸𐰸 𐰋𐰤 𐰇𐰔𐰢 𐱃𐰉𐰍𐰲 𐰃𐰠𐰭𐰀 𐰶𐰃𐰞𐰦𐰢\n𐱅𐰇𐰼𐰚 𐰉𐰆𐰑𐰣 𐱃𐰉𐰍𐰲𐰴𐰀 𐰚𐰇𐰼𐰇𐰼 𐰼𐱅𐰃",
        "transliteration": "Bilgä Toñuquq ben özüm Tabγač eliŋä qïlïntïm.\nTürk bodun Tabγačqa körür erti.",
        "translation": (
            "Men — dono To'nyuquq. O'zim Tabg'ach (Xitoy) yurtida voyaga yetdim.\n"
            "Turk xalqi (u paytda) Tabg'achga qaram edi."
        ),
        "image": IMG + "Bilge%20Tonyukuk%20-%20Orkhon%20Inscriptions.jpeg?width=800",
        "researchers": ["V.V. Radlov", "S.Ye. Malov", "H.N. Orkun"],
        "bibliography": [
            "Radloff W. (1899). Die alttürkischen Inschriften der Mongolei. Zweite Folge.",
            "Малов С.Е. (1951). Памятники древнетюркской письменности.",
            "Aydın E. (2019). Türklerin Bilge Atası Tonyukuk.",
        ],
        "tags": ["Ko'ktürk", "runik", "memuar", "Mo'g'uliston"],
        "views": 245, "word_count": 312, "line_count": 62,
        "importance": 5, "featured": True,
    },
    {
        "title": "Kültigin bitigi",
        "title_original": "𐰚𐰇𐰠 𐱅𐰃𐰏𐰤",
        "year": 732, "year_end": None,
        "location": "Mo'g'uliston, Arxangay viloyati",
        "script": "koktürk", "category": "bitiglar", "language": "Ko'hna turkiy",
        "description": (
            "Ikkinchi Ko'ktürk xoqonligining buyuk sarkardasi Kultegin sharafiga akasi "
            "Bilga xoqon o'rnattirgan ulkan marmar bitik. Turkiy xalqlar tarixi, tili va "
            "davlatchiligi haqidagi eng muhim manbalardan biri."
        ),
        "significance": (
            "Turkiy adabiy tilning mumtoz yodgorligi. 1893-yili V. Tomsen aynan shu "
            "bitik matni asosida runik yozuvni o'qish kalitini topgan."
        ),
        "full_text": (
            "𐰇𐰔𐰀 𐰚𐰇𐰚 𐱅𐰭𐰼𐰃 𐰽𐰺𐰀 𐰖𐰍𐰔 𐰘𐰃𐰼 𐰶𐰃𐰞𐰦𐰸𐰑𐰀 𐰚𐰃𐰤 𐰺𐰀 𐰚𐰃𐰾𐰃 𐰆𐰍𐰞𐰃 𐰶𐰃𐰞𐰣𐰢𐰾\n"
            "𐰚𐰃𐰾𐰃 𐰆𐰍𐰞𐰃𐰦𐰀 𐰇𐰔𐰀 𐰲𐰈𐰢 𐰯𐰢 𐰉𐰆𐰢𐰣 𐰴𐰍𐰣 𐰃𐰾𐱅𐰢𐰃 𐰴𐰍𐰣 𐰆𐰞𐰺𐰢𐰾"
        ),
        "transliteration": (
            "Üzä kök täŋri asra yaγïz yer qïlïntuqda ekin ara kişi oγlï qïlïnmïş.\n"
            "Kişi oγlïnta üzä ečüm apam Bumïn qaγan İstämi qaγan olurmïş."
        ),
        "translation": (
            "Yuqorida ko'k osmon, pastda qo'ng'ir yer yaratilganda, ikkisi orasida inson bolalari yaratilgan.\n"
            "Inson bolalari uzra ota-bobolarim Bumin xoqon (va) Istami xoqon taxtga o'tirgan."
        ),
        "image": IMG + "Kultigin%20Monument%20of%20Orkhon%20Inscriptions.jpeg?width=800",
        "researchers": ["V. Tomsen", "V.V. Radlov", "T. Tekin"],
        "bibliography": [
            "Thomsen V. (1896). Inscriptions de l'Orkhon déchiffrées.",
            "Tekin T. (1968). A Grammar of Orkhon Turkic.",
            "Радлов В.В. (1894–1895). Атлас древностей Монголии.",
        ],
        "tags": ["Ko'ktürk", "Orxun", "xoqonlik", "runik"],
        "views": 389, "word_count": 524, "line_count": 94,
        "importance": 5, "featured": True,
    },
    {
        "title": "Bilge Xoqon bitigi",
        "title_original": "𐰋𐰃𐰠𐰏𐰀 𐰴𐰍𐰣",
        "year": 735, "year_end": None,
        "location": "Mo'g'uliston, Arxangay viloyati",
        "script": "koktürk", "category": "bitiglar", "language": "Ko'hna turkiy",
        "description": (
            "Ikkinchi Ko'ktürk xoqonligi hukmdori Bilga xoqon vafotidan so'ng o'g'li "
            "o'rnattirgan yodgorlik. Xoqonning xalqqa murojaati, davlat birligi va "
            "ibrat haqidagi o'gitlari bitilgan."
        ),
        "significance": (
            "Xoqonning xalqqa murojaati turkiy notiqlik san'atining cho'qqisi sanaladi; "
            "Kultegin bitigi bilan birga O'rxun vodiysidagi yaxlit majmuani tashkil etadi."
        ),
        "full_text": (
            "𐱅𐰭𐰼𐰃 𐱅𐰏 𐱅𐰭𐰼𐰃𐰓𐰀 𐰉𐰆𐰞𐰢𐰾 𐱅𐰇𐰼𐰚 𐰋𐰃𐰠𐰏𐰀 𐰴𐰍𐰣 𐰉𐰆 𐰇𐰓𐰚𐰀 𐰆𐰞𐰺𐱃𐰢\n"
            "𐰽𐰉𐰢𐰣 𐱅𐰇𐰚𐱅𐰃 𐰾𐰃𐰓𐰏𐰠"
        ),
        "transliteration": (
            "Täŋri täg täŋridä bolmïş Türk Bilgä qaγan bu ödkä olurtum.\n"
            "Sabïmïn tükäti eşidgil!"
        ),
        "translation": (
            "Osmon yanglig', osmonda bo'lgan (tug'ilgan) Turk Bilga xoqon — bu taxtga o'tirdim.\n"
            "So'zimni oxirigacha eshitgin!"
        ),
        "image": IMG + "Bilge%20Khagan%20monument%20Mongolia.JPG?width=800",
        "researchers": ["V. Tomsen", "H.N. Orkun", "T. Tekin"],
        "bibliography": [
            "Orkun H.N. (1936–1941). Eski Türk Yazıtları I–IV.",
            "Tekin T. (1988). Orhon Yazıtları.",
        ],
        "tags": ["Ko'ktürk", "Orxun", "xoqon", "runik"],
        "views": 312, "word_count": 487, "line_count": 88,
        "importance": 5, "featured": True,
    },
    {
        "title": "Ongin bitigi",
        "title_original": "Ongin",
        "year": 720, "year_end": None,
        "location": "Mo'g'uliston, O'vorxangay viloyati",
        "script": "koktürk", "category": "bitiglar", "language": "Ko'hna turkiy",
        "description": (
            "Ongin daryosi bo'yidan topilgan runik bitik. Ikkinchi xoqonlik davri "
            "zodagonlaridan biri va uning otasi xotirasiga o'rnatilgan."
        ),
        "significance": (
            "Xoqonlik tiklanishi davridagi harbiy voqealarni mahalliy bek nigohidan "
            "yorituvchi kam sonli manbalardan biri."
        ),
        "full_text": "𐰲𐰈𐰢𐰔 𐰯𐰢𐰔 𐰖𐰢𐰃 𐰴𐰍𐰣 𐱃𐰈𐰼𐱅 𐰉𐰆𐰞𐰭𐰍 𐰶𐰃𐰽𐰢𐰾 𐰖𐰃𐰍𐰢𐰾 𐰖𐰖𐰢𐰾 𐰉𐰽𐰢𐰾",
        "transliteration": "Ečümiz apamïz Yamï qaγan tört buluŋuγ qïsmïş, yïγmïş, yaymïş, basmïş.",
        "translation": "Ota-bobomiz Yami xoqon to'rt tarafni siqib (bo'ysundirib), yig'ib, yoyib, bosib olgan.",
        "image": "",
        "researchers": ["G. Klouson", "V.V. Radlov", "E. Trijarski"],
        "bibliography": [
            "Clauson G. (1957). The Ongin Inscription. JRAS.",
            "Радлов В.В. (1895). Атлас древностей Монголии.",
        ],
        "tags": ["Ko'ktürk", "runik", "Mo'g'uliston"],
        "views": 98, "word_count": 154, "line_count": 12,
        "importance": 3, "featured": False,
    },
    {
        "title": "Kul-chur bitigi (Ixe-Xushotu)",
        "title_original": "Küli Čor",
        "year": 724, "year_end": None,
        "location": "Mo'g'uliston, To'v viloyati",
        "script": "koktürk", "category": "bitiglar", "language": "Ko'hna turkiy",
        "description": (
            "Tardush qabilalarini boshqargan sarkarda Kul-chur xotirasiga o'rnatilgan "
            "runik bitik. Ixe-Xushotu degan joydan topilgan."
        ),
        "significance": (
            "Xoqonlikning g'arbiy qanoti (Tardush) boshqaruvi haqida ma'lumot beruvchi "
            "asosiy epigrafik manba."
        ),
        "full_text": "𐱃𐰺𐰑𐰆𐰾 𐰉𐰆𐰑𐰣𐰍 𐰃𐱅𐰃 𐰚𐰇𐰠 𐰲𐰆𐰺",
        "transliteration": "Tarduš bodunïγ eti Kül čor…",
        "translation": "Kul-chur Tardush xalqini (boshqarib) tartibga soldi…",
        "image": "",
        "researchers": ["V. Kotvich", "A.N. Samoylovich"],
        "bibliography": [
            "Kotwicz W., Samoïlovitch A. (1928). Le monument turc d'Ikhe-khuchotu en Mongolie centrale.",
        ],
        "tags": ["Ko'ktürk", "runik", "Tardush"],
        "views": 87, "word_count": 196, "line_count": 29,
        "importance": 3, "featured": False,
    },
    {
        "title": "Bugut bitigi",
        "title_original": "Bugut",
        "year": 584, "year_end": None,
        "location": "Mo'g'uliston, Arxangay viloyati",
        "script": "sogd", "category": "bitiglar", "language": "So'g'd tili",
        "description": (
            "Birinchi Ko'ktürk xoqonligi davridan qolgan eng qadimgi tosh bitik. "
            "Taspar xoqon xotirasiga o'rnatilgan bo'lib, matni so'g'd tilida bitilgan."
        ),
        "significance": (
            "Toshning uch tarafi so'g'dcha, bir tarafi brahma yozuvida — ilk xoqonlik "
            "davrida so'g'd tili rasmiy diplomatiya tili bo'lganining yorqin dalili."
        ),
        "full_text": "(So'g'd tilida, ilmiy transliteratsiyada)\n…βγy mγʾn tykyn…",
        "transliteration": "…baγi Maγan tegin…",
        "translation": "…ilohiy Mag'an-tegin…",
        "image": IMG + "Bugut.jpg?width=800",
        "researchers": ["V.A. Livshits", "S.G. Klyashtorniy", "Y. Yoshida"],
        "bibliography": [
            "Kljaštornyj S.G., Livšic V.A. (1972). The Sogdian Inscription of Bugut Revised. AOH 26.",
        ],
        "tags": ["So'g'd", "birinchi xoqonlik", "Mo'g'uliston"],
        "views": 178, "word_count": 148, "line_count": 24,
        "importance": 4, "featured": False,
    },
    {
        "title": "Tariat (Terxin) bitigi",
        "title_original": "Tariat",
        "year": 753, "year_end": None,
        "location": "Mo'g'uliston, Arxangay viloyati",
        "script": "koktürk", "category": "bitiglar", "language": "Ko'hna turkiy",
        "description": (
            "Uyg'ur xoqonligi asoschisi Eletmish Bilga xoqon o'rnattirgan runik bitik. "
            "Terxin daryosi bo'yidan 1969–1970-yillarda topilgan."
        ),
        "significance": (
            "Uyg'ur xoqonligining ilk davri, qabilalar joylashuvi va boshqaruv tizimi "
            "haqida noyob ma'lumotlar beradi."
        ),
        "full_text": "𐱅𐰭𐰼𐰃𐰓𐰀 𐰉𐰆𐰞𐰢𐰾 𐰃𐰠 𐰃𐱅𐰢𐰾 𐰋𐰃𐰠𐰏𐰀 𐰴𐰍𐰣 𐰉𐰈𐰓𐰚𐰀 𐰆𐰞𐰺𐱃𐰢",
        "transliteration": "Täŋridä bolmïş El etmiş Bilgä qaγan bödkä olurtum.",
        "translation": "Osmonda bo'lgan (osmon yorlaqagan), el (davlat) tuzgan Dono xoqon — bu taxtga o'tirdim.",
        "image": "",
        "researchers": ["M. Shinexuu", "S.G. Klyashtorniy", "T. Tekin"],
        "bibliography": [
            "Tekin T. (1983). The Tariat (Terkhin) Inscription. AOH 37.",
            "Кляшторный С.Г. (1980). Терхинская надпись.",
        ],
        "tags": ["Uyg'ur xoqonligi", "runik", "Mo'g'uliston"],
        "views": 121, "word_count": 235, "line_count": 30,
        "importance": 4, "featured": False,
    },
    {
        "title": "Shine-Usu bitigi",
        "title_original": "Šine-Usu",
        "year": 759, "year_end": None,
        "location": "Mo'g'uliston, Zavxan viloyati",
        "script": "koktürk", "category": "bitiglar", "language": "Ko'hna turkiy",
        "description": (
            "Uyg'ur xoqoni Mo'yin-chur (Bayan-cho'r) xotirasiga o'rnatilgan, runik "
            "yozuvdagi eng yirik bitiklardan biri (50 qatordan ortiq). Xoqonning harbiy "
            "yurishlari yilma-yil bayon etilgan."
        ),
        "significance": (
            "Uyg'ur xoqonligi tarixining birlamchi yilnomasi; Ko'ktürk yozuvi uyg'urlar "
            "davrida ham davom etganini ko'rsatadi."
        ),
        "full_text": "𐱅𐰭𐰼𐰃𐰓𐰀 𐰉𐰆𐰞𐰢𐰾 𐰃𐰠 𐰃𐱅𐰢𐰾 𐰋𐰃𐰠𐰏𐰀 𐰴𐰍𐰣",
        "transliteration": "Täŋridä bolmïş El etmiş Bilgä qaγan…",
        "translation": "Osmonda bo'lgan, el (davlat) tuzgan Dono xoqon…",
        "image": "",
        "researchers": ["G.J. Ramstedt", "T. Moriyasu", "A. Ochir"],
        "bibliography": [
            "Ramstedt G.J. (1913). Zwei uigurische Runeninschriften in der Nord-Mongolei.",
            "Moriyasu T., Ochir A. (1999). Provisional Report of Researches on Historical Sites and Inscriptions in Mongolia.",
        ],
        "tags": ["Uyg'ur xoqonligi", "runik", "yilnoma"],
        "views": 156, "word_count": 396, "line_count": 68,
        "importance": 4, "featured": False,
    },
    {
        "title": "Suji bitigi",
        "title_original": "Suji",
        "year": 840, "year_end": None,
        "location": "Mo'g'uliston, Suji dovoni",
        "script": "koktürk", "category": "bitiglar", "language": "Ko'hna turkiy",
        "description": (
            "Qirg'izlar uyg'ur xoqonligini yenggan davrga (IX asr o'rtasi) oid runik "
            "bitik. Muallif o'z nasl-nasabi va boyligi haqida faxr bilan yozadi."
        ),
        "significance": (
            "Qirg'iz davri runik yozuvining Mo'g'ulistondagi nodir namunasi; oddiy "
            "zodagon hayotini o'z tilidan hikoya qiladi."
        ),
        "full_text": (
            "𐰆𐰖𐰍𐰺 𐰘𐰃𐰼𐰃𐰦𐰀 𐰖𐰍𐰞𐰴𐰺 𐰴𐰣 𐱃𐰀 𐰚𐰠𐱅𐰢\n"
            "𐰶𐰃𐰺𐰶𐰃𐰔 𐰆𐰍𐰞𐰃 𐰢𐰤 𐰉𐰆𐰖𐰞𐰀 𐰸𐰆𐱃𐰞𐰆𐰍 𐰖𐰺𐰍𐰣 𐰢𐰤"
        ),
        "transliteration": (
            "Uyγur yerintä Yaγlaqar qan ata keltim.\n"
            "Qïrqïz oγlï men. Boyla qutluγ yarγan men."
        ),
        "translation": (
            "Uyg'ur yeridan Yag'laqar xon ota (avlodi bo'lib) keldim.\n"
            "Qirg'iz o'g'liman. Boyla Qutlug' Yarg'an (unvonli) men."
        ),
        "image": "",
        "researchers": ["G.J. Ramstedt", "S.Ye. Malov"],
        "bibliography": [
            "Ramstedt G.J. (1913). Zwei uigurische Runeninschriften in der Nord-Mongolei.",
            "Малов С.Е. (1959). Памятники древнетюркской письменности Монголии и Киргизии.",
        ],
        "tags": ["qirg'iz", "runik", "Mo'g'uliston"],
        "views": 112, "word_count": 260, "line_count": 11,
        "importance": 3, "featured": False,
    },
    {
        "title": "Yenisey bitiklari",
        "title_original": "Yenisey",
        "year": 700, "year_end": 900,
        "location": "Sibir, Yenisey daryosi havzasi",
        "script": "koktürk", "category": "bitiglar", "language": "Ko'hna turkiy",
        "description": (
            "Yenisey havzasida topilgan 200 dan ortiq mayda tosh bitiklar to'plami. "
            "Aksariyati marhum tilidan aytilgan vidolashuv — marsiya matnlaridir."
        ),
        "significance": (
            "Runik yozuvning Sibirdagi keng tarqalishini ko'rsatadi; turkiy marsiya "
            "(yig'i) janrining eng qadimgi yozma namunalari."
        ),
        "full_text": "𐰸𐰆𐰖𐰑𐰀 𐰸𐰆𐰨𐰆𐰖𐰢𐰴𐰀 𐰇𐰔𐰓𐰀 𐰆𐰍𐰞𐰢𐰴𐰀 𐰋𐰇𐰚𐰢𐰓𐰢",
        "transliteration": "Quyda qunčuyïmqa, özdä oγlïmqa bökmädim.",
        "translation": "Uydagi malikamga (xotinimga), vodiydagi o'g'limga to'ymay (ayrilib) ketdim.",
        "image": "",
        "researchers": ["V.V. Radlov", "S.Ye. Malov", "D.D. Vasilyev"],
        "bibliography": [
            "Малов С.Е. (1952). Енисейская письменность тюрков.",
            "Васильев Д.Д. (1983). Графический фонд памятников тюркской рунической письменности азиатского ареала.",
        ],
        "tags": ["Ko'ktürk", "Sibir", "qirg'iz", "marsiya"],
        "views": 201, "word_count": 230, "line_count": 45,
        "importance": 3, "featured": False,
    },
    {
        "title": "Talas bitiklari",
        "title_original": "Talas",
        "year": 700, "year_end": 900,
        "location": "Qirg'iziston, Talas vodiysi",
        "script": "koktürk", "category": "bitiglar", "language": "Ko'hna turkiy",
        "description": (
            "O'rta Osiyoda — Talas vodiysida topilgan runik bitiklar guruhi. Qoya va "
            "qayroqtoshlarga o'yilgan qisqa xotira matnlaridan iborat."
        ),
        "significance": (
            "Runik yozuv faqat Mo'g'uliston va Sibirda emas, O'rta Osiyoda ham keng "
            "qo'llanilganining asosiy isboti."
        ),
        "full_text": "𐰆𐱃𐰆𐰔 𐰆𐰍𐰞𐰣 𐰽𐰍𐰑𐰲𐰞𐰺𐰃",
        "transliteration": "Otuz oγlan saγdïčlarï…",
        "translation": "O'ttiz yigit — qadrdon (sog'dich) do'stlar…",
        "image": IMG + "Talas%20tas%20yazma%201.jpg?width=800",
        "researchers": ["V.A. Kallaur", "S.Ye. Malov", "Ch. Jumagulov"],
        "bibliography": [
            "Малов С.Е. (1959). Памятники древнетюркской письменности Монголии и Киргизии.",
            "Джумагулов Ч. (1963). Эпиграфика Киргизии.",
        ],
        "tags": ["Ko'ktürk", "O'rta Osiyo", "Talas", "runik"],
        "views": 167, "word_count": 175, "line_count": 38,
        "importance": 3, "featured": False,
    },

    # ── Qo'lyozma kitoblar ────────────────────────────────────────────────────
    {
        "title": "Irq Bitig",
        "title_original": "𐰃𐰺𐰴 𐰋𐰃𐱅𐰃𐰏",
        "year": 930, "year_end": None,
        "location": "Dunxuang, Xitoy (topilgan joyi)",
        "script": "koktürk", "category": "qollanmalar", "language": "Ko'hna turkiy",
        "description": (
            "«Ta'birnoma» — runik yozuvda qog'ozga bitilgan fol kitobi. 65 ta fol "
            "(irq)dan iborat; har biri kichik manzara bilan tasvirlanib, «yaxshi» yoki "
            "«yomon» deb yakunlanadi. Dunxuang g'oridan topilgan."
        ),
        "significance": (
            "Runik yozuvda TO'LIQ saqlanib qolgan yagona qo'lyozma kitob (British "
            "Library, Or. 8212/161); ko'hna turkiy tasavvur va mifologiya xazinasi."
        ),
        "full_text": (
            "𐱅𐰤 𐰾𐰃 𐰢𐰤 𐰖𐰺𐰃𐰣 𐰚𐰃𐰲𐰀 𐰞𐱃𐰆𐰣 𐰇𐰼𐰏𐰃𐰤 𐰇𐰔𐰀 𐰆𐰞𐰆𐰺𐰆𐰯𐰣 𐰢𐰭𐰃𐰠𐰀𐰘𐰇𐰼 𐰢𐰤\n"
            "𐰨𐰀 𐰋𐰃𐰠𐰃𐰭𐰠𐰼 𐰓𐰏𐰇 𐰆𐰞"
        ),
        "transliteration": (
            "Tän si män. Yarïn kečä altun örgin üzä olurupan mäŋiläyür män.\n"
            "Anča biliŋlär: ädgü ol!"
        ),
        "translation": (
            "Men — Tan'si (Osmon o'g'li). Ertayu kech oltin taxt uzra o'tirib shodlanurmen.\n"
            "Shuni bilinglar: bu — yaxshi (fol)!  (1-irq)"
        ),
        "image": IMG + "Irk%20bitig%2007.jpg?width=800",
        "researchers": ["V. Tomsen", "A. Stayn", "T. Tekin"],
        "bibliography": [
            "Thomsen V. (1912). Dr. M.A. Stein's manuscripts in Turkish 'runic' script from Miran and Tun-huang. JRAS.",
            "Tekin T. (1993). Irk Bitig: The Book of Omens.",
        ],
        "tags": ["runik", "Dunxuang", "ta'birnoma", "mifologiya"],
        "views": 223, "word_count": 1650, "line_count": 104,
        "importance": 4, "featured": True,
    },
    {
        "title": "Xuastuanift",
        "title_original": "Xuāstvānīft",
        "year": 800, "year_end": 900,
        "location": "Turfon, Xitoy (topilgan joyi)",
        "script": "uyg'ur", "category": "diniy", "language": "Ko'hna uyg'ur",
        "description": (
            "Moniy dini e'tiqodchilari (tinglovchilar) uchun tuzilgan tavba duosi "
            "matni. Har bo'lim gunohlarni sanab, «Manastar hirza!» (gunohimni "
            "kechirgil) iltijosi bilan tugaydi."
        ),
        "significance": (
            "Ko'hna turkiy diniy nasrning eng yaxshi saqlangan namunasi; moniylik "
            "ta'limotining turkiy muhitdagi in'ikosini ko'rsatadi."
        ),
        "full_text": (
            "(Ko'hna uyg'ur yozuvida; lotin transliteratsiyasi)\n"
            "Täŋrim, amtï ökünürmen, yazuqda boşunu ötünürmen.\n"
            "Manastar hirza!"
        ),
        "transliteration": (
            "Täŋrim, amtï ökünürmen, yazuqda boşunu ötünürmen.\n"
            "Manastar hirza!"
        ),
        "translation": (
            "Tangrim, endi tavba qilurmen, gunohdan forig' bo'lishni so'rarmen.\n"
            "Manastar hirza! (Gunohimni kechirgil!)"
        ),
        "image": IMG + "Fragment%20of%20a%20leaf%20from%20a%20Uyghur-Manichaean%20Book%20%28MIK%20III%204959%29.png?width=800",
        "researchers": ["A. fon Le Kok", "V. Bang", "L.V. Dmitriyeva"],
        "bibliography": [
            "Le Coq A. von (1911). Chuastuanift, ein Sündenbekenntnis der manichäischen Auditores.",
            "Дмитриева Л.В. (1963). Хуастуанифт (введение, текст, перевод).",
        ],
        "tags": ["Uyg'ur", "moniylik", "din", "Turfon"],
        "views": 176, "word_count": 2840, "line_count": 220,
        "importance": 4, "featured": False,
    },
    {
        "title": "Altun Yoruq",
        "title_original": "Altun önglüg yaruq yaltrïqlïγ sudur",
        "year": 930, "year_end": 960,
        "location": "Turfon, Xitoy (topilgan joyi)",
        "script": "uyg'ur", "category": "diniy", "language": "Ko'hna uyg'ur",
        "description": (
            "Buddaviylikning «Oltin yorug'» sutrasining ko'hna uyg'ur tiliga qilingan "
            "keng hajmli tarjimasi («Oltin Yorug'»). Tarjimon — beshbaliqlik Singqu "
            "Seli Tutung."
        ),
        "significance": (
            "Ko'hna uyg'ur buddaviy adabiyotining eng yirik yodgorligi; tarjima "
            "san'ati va boy diniy terminologiyasi bilan qimmatli."
        ),
        "full_text": (
            "(Ko'hna uyg'ur yozuvida; transliteratsiya)\n"
            "Namo but, namo darm, namo saŋ!"
        ),
        "transliteration": "Namo but, namo darm, namo saŋ!",
        "translation": "Buddaga sig'inaman, Ta'limotga sig'inaman, Jamoaga sig'inaman!",
        "image": IMG + "Han-Uyghur%20scripts%20Buddhist%20text%20from%20the%20Gaochang%20era.jpg?width=800",
        "researchers": ["V.V. Radlov", "S.Ye. Malov", "J. Kaya"],
        "bibliography": [
            "Радлов В.В., Малов С.Е. (1913–1917). Suvarṇaprabhāsa (Сутра золотого блеска).",
            "Kaya C. (1994). Uygurca Altun Yaruk: Giriş, Metin ve Dizin.",
        ],
        "tags": ["Uyg'ur", "buddizm", "sutra", "Turfon"],
        "views": 189, "word_count": 18500, "line_count": 1240,
        "importance": 4, "featured": False,
    },
    {
        "title": "Turfon qo'lyozmalari",
        "title_original": "Turfan Sammlung",
        "year": 800, "year_end": 1000,
        "location": "Turfon, Xitoy",
        "script": "uyg'ur", "category": "qollanmalar", "language": "Ko'hna uyg'ur",
        "description": (
            "Turfon vohasidan topilgan minglab qo'lyozma parchalari: diniy matnlar "
            "bilan birga shartnomalar, xatlar, taqvim va tibbiy bitiklar. Kundalik "
            "hayotni aks ettiruvchi noyob to'plam."
        ),
        "significance": (
            "Ko'hna uyg'ur jamiyatining huquqiy va xo'jalik hayotini hujjatlar orqali "
            "o'rganish imkonini beradi — o'rta asr turkiy «arxivi»."
        ),
        "full_text": (
            "(Xo'jalik hujjatidan namuna; transliteratsiya)\n"
            "Yïlan yïl bešinč ay bir yaŋïqa maŋa Turïqa böz kärgäk bolup…"
        ),
        "transliteration": "Yïlan yïl bešinč ay bir yaŋïqa maŋa Turïqa böz kärgäk bolup…",
        "translation": "Ilon yili, beshinchi oy, birinchi (yangi) kunida menga — Turiga — bo'z (mato) kerak bo'lib…",
        "image": IMG + "Old%20Uyghur%20alphabet%20-%20burhan%20%28manuscript%29.jpg?width=800",
        "researchers": ["A. Gryunvedel", "A. fon Le Kok", "A. fon Gabain"],
        "bibliography": [
            "Gabain A. von (1941). Alttürkische Grammatik.",
            "Zieme P. (1985). Buddhistische Stabreimdichtungen der Uiguren.",
        ],
        "tags": ["Uyg'ur", "Turfon", "hujjatlar", "qo'lyozma"],
        "views": 198, "word_count": 8600, "line_count": 620,
        "importance": 4, "featured": False,
    },

    # ── Qoraxoniylar davri ────────────────────────────────────────────────────
    {
        "title": "Qutadg'u Bilig",
        "title_original": "قۇتادغۇ بىلىگ",
        "year": 1069, "year_end": 1070,
        "location": "Koshg'ar (Xitoy)",
        "script": "arab", "category": "adabiy", "language": "Qoraxoniy turkiy",
        "description": (
            "Yusuf Xos Hojib qalamiga mansub 6600 baytdan ortiq siyosiy-axloqiy "
            "doston. «Baxt keltiruvchi bilim» ma'nosini anglatadi; asar uchun muallifga "
            "«Xos Hojib» unvoni berilgan."
        ),
        "significance": (
            "Turkiy tildagi ilk yirik adabiy doston. Uch qo'lyozma nusxasi saqlangan: "
            "Vena (uyg'ur yozuvida), Farg'ona va Qohira (arab yozuvida)."
        ),
        "full_text": "بايات آتى بيرلە سۆزۈگ باشلاديم\nتۆرۈتگەن ئىگىدگەن كېچۈرگەن ئىدىم",
        "transliteration": "Bayat atï birlä sözüg başladïm,\ntörütgän egidgän kečürgän idim.",
        "translation": "Tangri nomi bilan so'zni boshladim —\n(U) yaratgan, o'stirgan va kechirgan egamdir.",
        "image": IMG + "QutadughuBiliq%20wien%20p.10.jpg?width=800",
        "researchers": ["V.V. Radlov", "R.R. Arat", "Q. Karimov"],
        "bibliography": [
            "Arat R.R. (1947). Kutadgu Bilig I: Metin.",
            "Каримов Қ. (1971). Қутадғу билиг (транскрипция ва ҳозирги ўзбек тилига тавсиф).",
            "Dankoff R. (1983). Wisdom of Royal Glory.",
        ],
        "tags": ["Qoraxoniy", "doston", "axloq", "siyosat"],
        "views": 467, "word_count": 67000, "line_count": 4800,
        "importance": 5, "featured": True,
    },
    {
        "title": "Devonu Lug'atit Turk",
        "title_original": "ديوان لغات الترك",
        "year": 1072, "year_end": 1074,
        "location": "Bog'dod (Iroq)",
        "script": "arab", "category": "qollanmalar", "language": "Ko'hna turkiy (arabcha izohli)",
        "description": (
            "Mahmud Koshg'ariyning qomusiy lug'ati: 8000 ga yaqin turkiy so'z arabcha "
            "izohlangan; maqollar, qo'shiqlar, qabilalar va shevalar haqida bebaho "
            "ma'lumotlar jamlangan."
        ),
        "significance": (
            "Turkiy tilshunoslikning tamal toshi; dunyodagi eng qadimgi turkiy dunyo "
            "xaritasi shu asarga ilova qilingan. Yagona nusxasi Istanbulda saqlanadi."
        ),
        "full_text": "تاغ تاغقا قاۋۇشماس، كىشى كىشىگە قاۋۇشۇر\n(«Devon»dagi maqollardan)",
        "transliteration": "Taγ taγqa qawuşmas, kişi kişigä qawuşur.",
        "translation": "Tog' tog' bilan qovushmas, kishi kishi bilan qovushar.",
        "image": IMG + "Mahmud%20al-Kashgari%20map.jpg?width=800",
        "researchers": ["K. Brokelman", "B. Atalay", "S. Mutallibov", "R. Dankoff"],
        "bibliography": [
            "Atalay B. (1939–1941). Divanü Lûgat-it-Türk Tercümesi I–III.",
            "Муталлибов С. (1960–1963). Девону луғотит турк I–III.",
            "Dankoff R., Kelly J. (1982–1985). Compendium of the Turkic Dialects I–III.",
        ],
        "tags": ["Qoraxoniy", "lug'at", "tilshunoslik", "xarita"],
        "views": 534, "word_count": 9000, "line_count": 680,
        "importance": 5, "featured": True,
    },
]

# Avvalgi seed'da bo'lib, endi olib tashlangan demo yozuvlar
# (Mo'yinchur bitigi — aslida Shine-Usu bitigining o'zi edi).
DEMO_REMOVED = ["Mo'yinchur bitigi"]


class Command(BaseCommand):
    help = "Ma'lumotlar bazasini boshlang'ich (demo) ma'lumotlar bilan to'ldiradi"

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help="Mavjud yodgorliklarni o'chirib, qayta yaratadi",
        )
        parser.add_argument(
            '--refresh-demo',
            action='store_true',
            help="Demo yozuvlarni (nomi bo'yicha) seed holatiga yangilaydi; boshqa yozuvlarga tegmaydi",
        )

    def handle(self, *args, **options):
        if options['reset']:
            Monument.objects.all().delete()
            self.stdout.write(self.style.WARNING("Barcha yodgorliklar o'chirildi."))

        # Sayt sozlamalari (mavjud bo'lsa tegilmaydi)
        SiteSettings.objects.get_or_create(
            pk=1,
            defaults={
                'site_title': 'Turkiy Yozma Yodgorliklar Korpusi',
                'site_subtitle': "VII–XI asrlardagi turkiy yozma merosning elektron to'plami",
                'about_text': (
                    "Bu korpus VII–XI asrlarda yaratilgan turkiy yozma yodgorliklarni o'rganish va "
                    "targ'ib qilish maqsadida yaratilgan. Ko'ktürk, So'g'd, Uyg'ur va Arab "
                    "yozuvlarida bitilgan yodgorliklar haqida batafsil ma'lumot olishingiz mumkin."
                ),
            }
        )

        # Seed'dan olib tashlangan (xato) demo yozuvlar — foydalanuvchi yuborganlariga tegilmaydi
        removed, _ = Monument.objects.filter(
            title__in=DEMO_REMOVED, is_user_submission=False).delete()
        if removed:
            self.stdout.write(self.style.WARNING(
                f"{removed} ta eskirgan demo yozuv o'chirildi."))

        # Ko'rishlar soni jonli statistika — mavjud yozuvda hech qachon qayta yozilmaydi
        live_fields = {'views'}

        created = updated = 0
        for data in MONUMENTS:
            # Faqat demo yozuvlar (is_user_submission=False) — foydalanuvchi yuborgan,
            # nomi demo bilan bir xil yodgorlik ustidan yozilmasin
            demo = Monument.objects.filter(title=data['title'], is_user_submission=False)
            if not demo.exists():
                if not Monument.objects.filter(title=data['title']).exists():
                    Monument.objects.create(**data)
                    created += 1
            elif options['refresh_demo']:
                fields = {k: v for k, v in data.items() if k not in live_fields}
                updated += demo.update(**fields)

        msg = f"{created} ta yangi yodgorlik qo'shildi."
        if options['refresh_demo']:
            msg += f" {updated} ta demo yozuv yangilandi."
        msg += f" Jami: {Monument.objects.count()} ta yodgorlik."
        self.stdout.write(self.style.SUCCESS(msg))
