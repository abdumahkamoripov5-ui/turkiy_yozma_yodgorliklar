"""Repository-root entrypoint for Vercel's Django detection."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / 'backend'))

from backend.manage import main

if __name__ == '__main__':
    main()
