from rest_framework import permissions, serializers, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .google_translation import (TranslationNotConfigured, TranslationProviderError,
                                 TranslationRateLimited,
                                 generate_interface_translation_batch)
from .models import InterfaceTranslation


TARGET_LANGUAGES = {'ru', 'en', 'tr', 'tg', 'ky', 'kk'}


class TranslationSourceInput(serializers.Serializer):
    key = serializers.CharField(max_length=512, trim_whitespace=True)
    source_text = serializers.CharField(max_length=2000, trim_whitespace=False)


class TranslationDraftInput(serializers.Serializer):
    items = serializers.ListField(child=TranslationSourceInput(), min_length=1, max_length=30, allow_empty=False)
    target_languages = serializers.ListField(
        child=serializers.ChoiceField(choices=sorted(TARGET_LANGUAGES)),
        min_length=1, max_length=6, allow_empty=False,
    )

    def validate(self, attrs):
        if any(not item['key'].strip() or not item['source_text'].strip() for item in attrs['items']):
            raise serializers.ValidationError({'items': 'Har bir kalit va manba matn bo‘sh bo‘lmasin.'})
        if len({item['key'] for item in attrs['items']}) != len(attrs['items']):
            raise serializers.ValidationError({'items': 'Bir to‘plam ichida takroriy kalit bo‘lmasin.'})
        if sum(len(item['source_text']) for item in attrs['items']) > 5000:
            raise serializers.ValidationError({'items': 'Bitta to‘plamdagi jami manba matn 5 000 belgidan oshmasin.'})
        if len(set(attrs['target_languages'])) != len(attrs['target_languages']):
            raise serializers.ValidationError({'target_languages': 'Har bir tilni faqat bir marta tanlang.'})
        return attrs


class CanGenerateTranslations(permissions.BasePermission):
    message = 'Google tarjima qoralamalarini yaratish huquqi kerak.'

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.is_staff
            and request.user.has_perm('korpus.use_google_translation')
            and request.user.has_perm('korpus.add_interfacetranslation')
        )


class GoogleTranslationDraftView(APIView):
    permission_classes = [CanGenerateTranslations]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'google_translate'

    def post(self, request):
        serializer = TranslationDraftInput(data=request.data)
        serializer.is_valid(raise_exception=True)
        values = serializer.validated_data
        try:
            batch_id, results = generate_interface_translation_batch(
                values['items'], values['target_languages'], request.user,
            )
        except TranslationNotConfigured:
            return Response({'detail': 'Google Cloud Translation sozlanmagan. Server environment qiymatlarini kiriting.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except TranslationProviderError:
            return Response({'detail': 'Google tarjima xizmati javob bermadi. Qoralama saqlanmadi.'}, status=status.HTTP_502_BAD_GATEWAY)
        except TranslationRateLimited as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        return Response({'batch_id': batch_id, 'results': results}, status=status.HTTP_201_CREATED)


class PublishedTranslationCatalogView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, language):
        if language not in TARGET_LANGUAGES | {'uz'}:
            return Response({'detail': 'Til kodi qo‘llab-quvvatlanmaydi.'}, status=status.HTTP_404_NOT_FOUND)
        rows = InterfaceTranslation.objects.filter(language=language, status='published').values_list('key', 'translated_text')
        return Response({'language': language, 'translations': dict(rows)})
