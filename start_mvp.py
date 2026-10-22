"""Local MVP launcher; never deploys or changes an existing admin password."""
import os
from pathlib import Path
import secrets
import socket
import subprocess
import sys
import threading
import webbrowser

ROOT = Path(__file__).resolve().parent
local_python = ROOT / '.venv' / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
if __name__ == '__main__' and local_python.exists() and Path(sys.prefix).resolve() != (ROOT / '.venv').resolve():
    os.execv(str(local_python), [str(local_python), str(Path(__file__).resolve()), *sys.argv[1:]])
os.environ.setdefault('DJANGO_DEBUG', 'True')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'turkiy_korpus.settings')
sys.path.insert(0, str(ROOT / 'backend'))


def prepare():
    import django
    django.setup()
    from django.core.management import call_command
    from django.contrib.auth import get_user_model
    from korpus.models import Monument

    call_command('migrate', interactive=False, verbosity=0)
    if not Monument.objects.exists():
        call_command('seed_data')
        Monument.objects.all().update(views=0)
    call_command('seed_mvp')
    local = ROOT / '.local'
    local.mkdir(exist_ok=True)
    User = get_user_model()
    if not User.objects.filter(is_superuser=True, is_active=True).exists():
        username = 'meros_admin'
        while User.objects.filter(username=username).exists():
            username = 'meros_admin_' + secrets.token_hex(3)
        password = secrets.token_urlsafe(18)
        User.objects.create_superuser(username, password=password)
        (local / 'MVP_admin_kirish.txt').write_text(
            'Mahalliy MVP admin kirishi\n\n'
            'Manzil: http://127.0.0.1:8000/django-admin/\n'
            f'Login: {username}\nParol: {password}\n\n'
            'Bu faylni ochiq ulashmang. Ishchi hostingda boshqa parol ishlating.\n', encoding='utf-8')
    if (local / 'MVP_admin_kirish.txt').exists():
        print('Admin kirish ma’lumotlari: .local/MVP_admin_kirish.txt')

    index = ROOT / 'frontend' / 'dist' / 'index.html'
    if not index.exists() or '/app/assets/' not in index.read_text(encoding='utf-8'):
        environment = {**os.environ, 'VITE_BASE': '/app/'}
        npm = 'npm.cmd' if os.name == 'nt' else 'npm'
        subprocess.run([npm, 'run', 'build'], cwd=ROOT / 'frontend', env=environment, check=True)


if __name__ == '__main__':
    try:
        prepare()
        if '--prepare-only' not in sys.argv:
            with socket.socket() as probe:
                occupied = probe.connect_ex(('127.0.0.1', 8000)) == 0
            if occupied:
                print('8000 port band. Mavjud manzil: http://127.0.0.1:8000/app/')
                webbrowser.open('http://127.0.0.1:8000/app/')
            else:
                print('MVP: http://127.0.0.1:8000/app/ — to‘xtatish: Ctrl+C')
                threading.Timer(2, lambda: webbrowser.open('http://127.0.0.1:8000/app/')).start()
                subprocess.run([sys.executable, str(ROOT / 'backend' / 'manage.py'),
                                'runserver', '127.0.0.1:8000', '--noreload'], check=True)
    except KeyboardInterrupt:
        pass
    except Exception as exc:
        print(f'Ishga tushirishda xato: {exc}')
        sys.exit(1)
