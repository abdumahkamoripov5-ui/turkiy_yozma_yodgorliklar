from django.conf import settings
from rest_framework import serializers
from .models import Monument, MonumentSubmission, SiteSettings


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
        if obj.year is None:
            return None
        return abs(obj.year) // 100 + (1 if abs(obj.year) % 100 else 0)


class MonumentDetailSerializer(MonumentListSerializer):
    """To'liq ma'lumot uchun serializer.

    author_email ataylab chiqarilmagan — API ochiq, muallif emaili maxfiy qolishi kerak.
    """
    class Meta(MonumentListSerializer.Meta):
        fields = MonumentListSerializer.Meta.fields + [
            'significance', 'full_text', 'transliteration', 'translation',
            'tags', 'created_at', 'updated_at',
        ]


def _check_upload(file, allowed_exts, max_mb, kind):
    ext = file.name.rsplit('.', 1)[-1].lower() if '.' in file.name else ''
    if ext not in allowed_exts:
        raise serializers.ValidationError(
            f"{kind} turi ruxsat etilmagan. Ruxsat etilganlar: {', '.join(sorted(allowed_exts))}."
        )
    if file.size > max_mb * 1024 * 1024:
        raise serializers.ValidationError(f"{kind} hajmi {max_mb} MB dan oshmasligi kerak.")
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
