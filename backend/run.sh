#!/bin/bash
# ═══════════════════════════════════════════════════
#  TURKIY KORPUS — Ubuntu / Linux da ishga tushirish
# ═══════════════════════════════════════════════════
set -e

# Ranglar
GREEN='\033[0;32m'; BLUE='\033[0;34m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

# Loyiha papkasi
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# Virtual environment — Linux fayl tizimida saqlanadi (/mnt/c da emas).
# Sabab: /mnt/c (Windows) da yaratilgan venv WSL da buziladi va sekin ishlaydi.
VENV="${TURKIY_VENV:-$HOME/venvs/turkiy_korpus}"

# Ma'lumotlar bazasi — standart SQLite. PostgreSQL uchun: export USE_POSTGRES=True
export USE_POSTGRES="${USE_POSTGRES:-False}"
# Lokal dev — DEBUG yoqiladi (settings'da standart holat — o'chiq, production uchun xavfsiz)
export DJANGO_DEBUG="${DJANGO_DEBUG:-True}"

echo ""
echo -e "${BOLD}${BLUE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${BLUE}║    TURKIY YOZMA YODGORLIKLAR KORPUSI         ║${NC}"
echo -e "${BOLD}${BLUE}║    VII–XI Asrlar · Ubuntu / Linux            ║${NC}"
echo -e "${BOLD}${BLUE}╚══════════════════════════════════════════════╝${NC}"
echo ""

# ── 1. Virtual environment ────────────────────────────────────────────────────
if [ ! -x "$VENV/bin/python" ]; then
    echo -e "${YELLOW}⚙  Virtual environment yaratilmoqda: $VENV${NC}"
    mkdir -p "$(dirname "$VENV")"
    # Ba'zi Ubuntu'larda ensurepip yo'q — shuning uchun --without-pip bilan ham urinamiz
    python3 -m venv "$VENV" 2>/dev/null || python3 -m venv --without-pip "$VENV"
fi

PY="$VENV/bin/python"

# ── 2. pip (kerak bo'lsa get-pip orqali bootstrap) ────────────────────────────
if ! "$PY" -m pip --version >/dev/null 2>&1; then
    echo -e "${YELLOW}⚙  pip o'rnatilmoqda (get-pip)...${NC}"
    curl -sSL https://bootstrap.pypa.io/get-pip.py -o /tmp/get-pip.py
    "$PY" /tmp/get-pip.py --quiet
fi

# ── 3. Bog'liqliklar ──────────────────────────────────────────────────────────
if ! "$PY" -c "import django, rest_framework, rest_framework_simplejwt, corsheaders, django_filters, PIL, whitenoise, storages" 2>/dev/null; then
    echo -e "${YELLOW}⚙  Kutubxonalar o'rnatilmoqda (requirements.txt)...${NC}"
    "$PY" -m pip install --quiet --upgrade pip
    "$PY" -m pip install --quiet -r requirements.txt
    echo -e "${GREEN}✓  Kutubxonalar tayyor${NC}"
fi

# ── 4. Migratsiya ─────────────────────────────────────────────────────────────
echo -e "${CYAN}⚙  Migratsiya tekshirilmoqda...${NC}"
"$PY" manage.py migrate --noinput 2>&1 | grep -E "Apply|No mig|OK" | head -5 || true

# ── 5. Ma'lumotlar ────────────────────────────────────────────────────────────
COUNT=$("$PY" manage.py shell -c "from korpus.models import Monument; print(Monument.objects.count())" 2>/dev/null | tail -1)
if [ "$COUNT" = "0" ] || [ -z "$COUNT" ]; then
    echo -e "${YELLOW}⚙  Ma'lumotlar bazasi to'ldirilmoqda...${NC}"
    "$PY" manage.py seed_data --reset 2>&1 | tail -3
    echo -e "${GREEN}✓  Yodgorliklar qo'shildi${NC}"
else
    echo -e "${GREEN}✓  Bazada ${COUNT} ta yodgorlik mavjud${NC}"
fi

# ── 6. Superuser ──────────────────────────────────────────────────────────────
# Parol: DJANGO_SUPERUSER_PASSWORD (env) yoki tasodifiy — kodda hech qachon qattiq yozilmaydi.
ADMIN_USER="${DJANGO_SUPERUSER_USERNAME:-admin}"
if ! "$PY" manage.py shell -c "from django.contrib.auth.models import User; import sys; sys.exit(0 if User.objects.filter(is_superuser=True).exists() else 1)" 2>/dev/null; then
    ADMIN_PASS="${DJANGO_SUPERUSER_PASSWORD:-$("$PY" -c "import secrets; print(secrets.token_urlsafe(12))")}"
    ADMIN_USER="$ADMIN_USER" ADMIN_PASS="$ADMIN_PASS" "$PY" manage.py shell -c "
import os
from django.contrib.auth.models import User
User.objects.create_superuser(os.environ['ADMIN_USER'], 'admin@korpus.uz', os.environ['ADMIN_PASS'])
" && echo -e "${GREEN}✓  Admin yaratildi: ${ADMIN_USER} / ${ADMIN_PASS}${NC}  (parolni saqlang)"
fi

# ── 7. Port ───────────────────────────────────────────────────────────────────
PORT="${PORT:-8000}"
if command -v lsof >/dev/null 2>&1 && lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠  Port $PORT band, 8001 ishlatilmoqda${NC}"
    PORT=8001
fi

# ── 8. Manzillar ──────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  Sayt manzillari:${NC}"
echo ""
echo -e "  ${CYAN}⚛️   Sayt (React)    →  ${BOLD}http://127.0.0.1:${PORT}/app/${NC}  (build: VITE_BASE=/app/ npm run build)"
echo -e "  ${YELLOW}⚙️   Admin panel     →  ${BOLD}http://127.0.0.1:${PORT}/django-admin/${NC}"
echo -e "  ${BLUE}📡  API (barcha)    →  ${BOLD}http://127.0.0.1:${PORT}/api/v2/monuments/${NC}"
echo -e "  ${BLUE}📊  Statistika API  →  ${BOLD}http://127.0.0.1:${PORT}/api/v2/monuments/stats/${NC}"
echo ""
echo -e "  ${YELLOW}👤  Admin login: ${BOLD}${ADMIN_USER}${NC}  (parol: DJANGO_SUPERUSER_PASSWORD yoki birinchi ishga tushirishdagi chiqish)"
echo -e "  ${CYAN}🗄   Baza: ${BOLD}SQLite${NC} (PostgreSQL uchun: export USE_POSTGRES=True)"
echo ""
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${YELLOW}Toxtatish uchun: ${BOLD}Ctrl+C${NC}"
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ── 9. Server ─────────────────────────────────────────────────────────────────
exec "$PY" manage.py runserver 127.0.0.1:$PORT
