"""CSV formula injection'dan himoya.

Excel/LibreOffice qiymat '=', '+', '-', '@' yoki Tab/CR bilan boshlansa, uni formula
sifatida bajaradi. Yodgorlik matnlari foydalanuvchi takliflaridan kelgani uchun
(is_user_submission), eksport qilinganda shunday qiymatlar oldiga apostrof qo'yiladi.
"""

_DANGEROUS_PREFIXES = ('=', '+', '-', '@', '\t', '\r')


def safe_cell(value):
    if isinstance(value, str) and value.startswith(_DANGEROUS_PREFIXES):
        return "'" + value
    return value
