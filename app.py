"""WSGI entrypoint bundling the Django API and React application."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / 'backend'))

from turkiy_korpus.wsgi import application
