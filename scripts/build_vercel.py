"""Build the same-origin frontend; Vercel collects Django static files itself."""
import os
from pathlib import Path
import shutil
import subprocess

root = Path(__file__).resolve().parent.parent
npm = shutil.which('npm.cmd' if os.name == 'nt' else 'npm')
if not npm:
    raise SystemExit('Node.js/npm is required to build the frontend.')
environment = {**os.environ, 'VITE_BASE': '/app/', 'VITE_API_URL': ''}
for command in ([npm, 'ci'], [npm, 'run', 'build']):
    subprocess.run(command, cwd=root / 'frontend', env=environment, check=True)

# Schema upgrades are explicit; normal builds never modify the database.
if os.environ.get('VERCEL_RUN_MIGRATIONS') == '1':
    import sys
    subprocess.run([sys.executable, 'manage.py', 'migrate', '--noinput'], cwd=root, check=True)

# Explicit one-off initialization only; ordinary builds never modify the database.
if os.environ.get('VERCEL_INITIALIZE_DATABASE') == '1':
    import sys
    subprocess.run([sys.executable, 'manage.py', 'bootstrap_vercel'], cwd=root, check=True)
