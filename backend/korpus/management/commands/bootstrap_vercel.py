"""Initialize the external database once without overwriting existing content."""
import os

from django.conf import settings
from django.core.management import BaseCommand, call_command
from django.db import transaction


class Command(BaseCommand):
    help = 'Migrate, create the shared cache table, and import local content into an empty corpus.'

    def handle(self, *args, **options):
        call_command('migrate', interactive=False)
        call_command('createcachetable')
        from korpus.models import Monument, Book, WordEntry, MediaLesson, WordPoll, SiteSettings
        fixture = settings.BASE_DIR.parent / 'deploy-data' / 'corpus.json'
        if any(model.objects.exists() for model in (Monument, Book, WordEntry, MediaLesson, WordPoll, SiteSettings)):
            self.stdout.write('Existing content detected; import skipped without overwriting records.')
        elif fixture.exists():
            with transaction.atomic():
                call_command('loaddata', str(fixture))
            self.stdout.write('Local corpus content imported successfully.')
        else:
            self.stdout.write('No transfer fixture; schema and cache are ready.')
        from django.contrib.auth import get_user_model
        User = get_user_model()
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
        if password and not User.objects.filter(is_superuser=True, is_active=True).exists():
            username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'meros_admin')
            if User.objects.filter(username=username).exists():
                self.stdout.write('Admin username already exists; credentials unchanged.')
            else:
                User.objects.create_superuser(username=username, password=password)
                self.stdout.write('Initial administrator created; password is not logged.')
