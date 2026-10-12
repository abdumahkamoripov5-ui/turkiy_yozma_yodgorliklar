from django.conf import settings
from rest_framework import serializers
from .models import Monument, MonumentSubmission, SiteSettings, century_of


class MonumentListSerializer(serializers.ModelSerializer):
    """Ro'yxat uchun yengil serializer."""
    script_display   = serializers.CharField(source='get_script_display',   read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    century = serializers.SerializerMethodField()

    class Meta:
        model  = Monument
        fields = [
            'id', 'title', 'title_original', 'year', 'year_end', 'century',
            'location', 'script', 'script_display', 'category', 'category_display',
            'language', 'image', 'description', 'word_count', 'line_count',
            'importance', 'views', 'featured', 'status',
            'researchers', 'bibliography',
            'author_name', 'author_institution', 'is_user_submission',
        ]

    def get_century(self, obj):
        return century_of(obj.year)


class MonumentDetailSerializer(MonumentListSerializer):
    """To'liq ma'lumot uchun serializer.

    author_email ataylab chiqarilmagan — API ochiq, muallif emaili maxfiy qolishi kerak.
    """
    class Meta(MonumentListSerializer.Meta):
        fields = MonumentListSerializer.Meta.fields + [
            'significance', 'full_text', 'transliteration', 'translation',
            'tags', 'created_at', 'updated_at',
        ]


# Hujjat turlarining fayl belgisi (magic bytes). Kengaytma o'zgartirilishi mumkin,
# shuning uchun mazmun ham tekshiriladi.
_OLE = b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1'   # doc, xls, ppt (eski Office)
_ZIP = b'PK\x03\x04'                        # docx, xlsx, pptx, odt, ods
_DOC_SIGNATURES = {
    'pdf': (b'%PDF-',),
    'doc': (_OLE,), 'xls': (_OLE,), 'ppt': (_OLE,),
    'docx': (_ZIP,), 'xlsx': (_ZIP,), 'pptx': (_ZIP,), 'odt': (_ZIP,), 'ods': (_ZIP,),
    'rtf': (b'{\rtf',),
}


def _looks_like_text(file):
    head = file.read(4096)
    file.seek(0)
    if b'\x00' in head:
        return False
    try:
        head.decode('utf-8')
    except UnicodeDecodeError:
        return False
    return True


def _check_content(file, ext, kind):
    """Fayl mazmuni kengaytmasiga mos kelishini tekshiradi."""
    from PIL import Image, UnidentifiedImageError
    try:
        if kind == 'Rasm':
            file.seek(0)
            with Image.open(file) as img:
                img.verify()  # buzilgan yoki soxta rasmni rad etadi
            file.seek(0)
            return
        if ext == 'txt':
            ok = _looks_like_text(file)
        else:
            file.seek(0)
            head = file.read(8)
            file.seek(0)
            ok = any(head.startswith(sig) for sig in _DOC_SIGNATURES.get(ext, ()))
    except (UnidentifiedImageError, OSError, SyntaxError, ValueError):
        ok = False
    if not ok:
        raise serializers.ValidationError(f"{kind} fayli mazmuni turiga mos kelmaydi.")


def _check_upload(file, allowed_exts, max_mb, kind):
    ext = file.name.rsplit('.', 1)[-1].lower() if '.' in file.name else ''
    if ext not in allowed_exts:
        raise serializers.ValidationError(
            f"{kind} turi ruxsat etilmagan. Ruxsat etilganlar: {', '.join(sorted(allowed_exts))}."
        )
    if file.size > max_mb * 1024 * 1024:
        raise serializers.ValidationError(f"{kind} hajmi {max_mb} MB dan oshmasligi kerak.")
    _check_content(file, ext, kind)
    return file


class MonumentSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MonumentSubmission
        fields = [
            'id', 'title', 'year', 'location', 'script', 'category', 'language',
            'description', 'image', 'image_file', 'document',
            'full_text', 'transliteration', 'translation', 'source_info',
            'author_name', 'author_email', 'author_institution', 'author_bio',
        ]
        extra_kwargs = {
            'image_file': {'required': False},
            'document':   {'required': False},
        }

    def validate_year(self, value):
        if not (-3000 <= value <= 2000):
            raise serializers.ValidationError("Yil -3000 va 2000 orasida bo'lishi kerak.")
        return value

    def validate_description(self, value):
        if len(value.strip()) < 30:
            raise serializers.ValidationError("Tavsif kamida 30 ta belgidan iborat bo'lishi kerak.")
        return value

    def validate_image_file(self, value):
        if not value:
            return value
        return _check_upload(value, settings.ALLOWED_IMAGE_EXTENSIONS, settings.MAX_IMAGE_SIZE_MB, 'Rasm')

    def validate_document(self, value):
        if not value:
            return value
        return _check_upload(value, settings.ALLOWED_DOC_EXTENSIONS, settings.MAX_DOC_SIZE_MB, 'Hujjat')


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model  = SiteSettings
        fields = ['site_title', 'site_subtitle', 'about_text', 'contact_email']
