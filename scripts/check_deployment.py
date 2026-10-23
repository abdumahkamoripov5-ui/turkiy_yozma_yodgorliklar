"""HTTP smoke checks; credentials and tokens are never printed."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
import urllib.request
import urllib.parse

parser = argparse.ArgumentParser()
parser.add_argument('url')
parser.add_argument('--credentials')
args = parser.parse_args()
base = args.url.rstrip('/')


def check(path):
    try:
        with urllib.request.urlopen(base + path, timeout=45) as response:
            body = response.read()
            result = {'path': path, 'status': response.status, 'bytes': len(body)}
            if urllib.parse.urlsplit(response.url).netloc != urllib.parse.urlsplit(base).netloc:
                result['error'] = 'Unexpected redirect to another host'
            if response.headers.get('Content-Type', '').startswith('application/json'):
                data = json.loads(body)
                result['count_or_status'] = data.get('count', data.get('status')) if isinstance(data, dict) else len(data)
            return result
    except Exception as error:
        return {'path': path, 'error': str(error)}


paths = ['/api/v2/health/', '/app/', '/api/v2/monuments/?page_size=1',
         '/api/v2/books/', '/api/v2/lessons/', '/django-admin/login/']
with ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(check, paths))
if args.credentials:
    credentials = dict(line.split(': ', 1) for line in Path(args.credentials).read_text(encoding='utf-8').splitlines() if ': ' in line)
    payload = json.dumps({'username': credentials['Login'], 'password': credentials['Parol']}).encode()
    request = urllib.request.Request(base + '/api/v2/auth/token/', data=payload,
                                     headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            data = json.load(response)
            results.append({'admin_login': response.status, 'token_received': bool(data.get('access'))})
    except Exception as error:
        results.append({'admin_login_error': str(error)})
print(json.dumps(results, ensure_ascii=False, indent=2))
raise SystemExit(1 if any(any('error' in key for key in result) for result in results) else 0)
