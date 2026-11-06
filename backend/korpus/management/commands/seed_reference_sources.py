from django.core.management.base import BaseCommand
from korpus.models import SourceLink


class Command(BaseCommand):
    help = 'Add referenced scholarly resources without overwriting existing entries.'

    def handle(self, *args, **options):
        references = [
            ('TDV İslâm Ansiklopedisi — Orhon Yazıtları', 'https://islamansiklopedisi.org.tr/orhon-yazitlari',
             'O‘rxun bitiklari, ularning sanalari va tadqiqot tarixiga oid ensiklopedik maqola. To‘liq korpus matni emas; har bir satr uchun alohida nashrni tekshiring.'),
            ('UNESCO — Orkhon Valley Cultural Landscape', 'https://whc.unesco.org/en/list/1081/',
             'O‘rxun vodiysining madaniy landshafti va tarixiy yodgorliklari haqida rasmiy ma’lumot. Tarixiy va geografik kontekst uchun.'),
            ('Kultegin — original photograph, Betta27', 'https://commons.wikimedia.org/wiki/File:Kultegin_monument_Mongolia.JPG',
             'Kultegin yodgorligining fotosurati. Muallif: Betta27. Wikimedia Commons sahifasida public domain deb belgilangan. Surat ilmiy transkripsiya emas.'),
            ('Bilge Qaghan — original photograph, Betta27', 'https://commons.wikimedia.org/wiki/File:Bilge_Khagan_monument_Mongolia.JPG',
             'Bilga xoqon yodgorligi fotosurati. Muallif: Betta27. Foydalanish huquqlari va surat tavsifi asl fayl sahifasida.'),
        ]
        created = 0
        for title, url, description in references:
            _, added = SourceLink.objects.get_or_create(url=url, defaults={
                'title': title, 'description': description, 'published': True})
            created += added
        self.stdout.write(f'{created} reference resources added; existing records preserved.')
