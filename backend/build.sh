#!/usr/bin/env bash
# Render build skripti — har deploy'da ishlaydi.
set -o errexit

pip install -r requirements.txt

# ── Frontend (React) — Django shu build'ni /app/ da beradi ────────────────────
# Render Python image'ida Node kafolatlanmagan: kerak bo'lsa nodeenv bilan o'rnatiladi.
if ! command -v npm >/dev/null 2>&1; then
  pip install -q nodeenv
  nodeenv -n 20.18.0 "$HOME/node-env"
  export PATH="$HOME/node-env/bin:$PATH"
fi
(cd ../frontend && npm ci --no-audit --no-fund && VITE_BASE=/app/ npm run build)

# Statik fayllar (Django admin / DRF) — WhiteNoise uzatadi
python manage.py collectstatic --no-input

# Migratsiya
python manage.py migrate

# Demo ma'lumotlar — faqat bazada yo'q demo yozuvlar qo'shiladi.
# Mavjud yozuvlar (admin tahrirlari, ko'rishlar soni) har deploy'da saqlanib qoladi.
# Demo matnlarni seed holatiga majburan qaytarish kerak bo'lsa, qo'lda:
#   python manage.py seed_data --refresh-demo
python manage.py seed_data

# Superuser — env'dan (DJANGO_SUPERUSER_*); eski demo parollar bloklanadi
python manage.py shell <<'PY'
import os
from django.contrib.auth.models import User

u = os.environ.get('DJANGO_SUPERUSER_USERNAME')
p = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
e = os.environ.get('DJANGO_SUPERUSER_EMAIL', '')

if u and p:
    obj, created = User.objects.get_or_create(username=u, defaults={'email': e})
    obj.is_staff = obj.is_superuser = obj.is_active = True
    # Parol faqat yangi akkauntga yoki zaif (eski demo) parolli akkauntga
    # o'rnatiladi — admin panelda qo'lda o'zgartirilgan parol saqlanib qoladi.
    if created or obj.check_password('admin123') or not obj.has_usable_password():
        obj.set_password(p)
        print(f"superuser paroli env'dan o'rnatildi: {u}")
    obj.save()

# Eski seed'dan qolgan, demo paroli o'zgartirilmagan akkauntlarni bloklash
for name, pwd in (('admin', 'admin123'), ('editor', 'editor123')):
    if name == u:
        continue
    du = User.objects.filter(username=name).first()
    if du and du.is_active and du.check_password(pwd):
        du.is_active = False
        du.save()
        print(f"{name}: demo parol bilan aktiv edi — bloklandi")

# Avval tasdiqlangan takliflar rasmlarida eskiradigan (imzolangan) S3 havolasi
# yozilgan bo'lishi mumkin — doimiy API manziliga almashtiriladi
host = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if host:
    from korpus.models import MonumentSubmission
    for sub in MonumentSubmission.objects.filter(status='approved', monument__isnull=False).exclude(image_file=''):
        url = f'https://{host}/api/v2/submission-image/{sub.pk}/'
        # Faqat hali xotira URL'i turgan bo'lsa (admin qo'lda boshqa rasm qo'ygan bo'lsa — tegilmaydi)
        if sub.image_file.name.rsplit('/', 1)[-1] in (sub.monument.image or ''):
            sub.monument.image = url
            sub.monument.save(update_fields=['image'])
            print(f"rasm havolasi yangilandi: {sub.monument.title}")
PY
