from django import forms
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe
from .models import Monument, WordEntry


class LinesField(forms.Field):
    widget = forms.Textarea(attrs={'rows': 4, 'class': 'vLargeTextField'})

    def prepare_value(self, value):
        return '\n'.join(value) if isinstance(value, list) else value

    def to_python(self, value):
        if not value:
            return []
        if isinstance(value, list):
            return value
        return [line.strip() for line in value.splitlines() if line.strip()]


class EquivalentsWidget(forms.Widget):
    template_name = 'admin/widgets/equivalents.html'
    languages = [('uz', 'O‘zbekcha'), ('tr', 'Turkcha'), ('kk', 'Qozoqcha'), ('ky', 'Qirg‘izcha'),
                 ('az', 'Ozarbayjoncha'), ('tk', 'Turkmancha'), ('tt', 'Tatarcha'), ('ug', 'Uyg‘urcha'),
                 ('ba', 'Boshqirdcha'), ('cv', 'Chuvashcha'), ('gag', 'Gagauzcha'),
                 ('crh', 'Qrim-tatarcha'), ('sah', 'Yoqutcha'), ('alt', 'Oltoycha')]

    class Media:
        js = ['korpus/admin/equivalents.js']

    def render(self, name, value, attrs=None, renderer=None):
        # Use project templates; the standalone forms renderer only searches app templates.
        return mark_safe(render_to_string(self.template_name, self.get_context(name, value, attrs)))

    def value_from_datadict(self, data, files, name):
        getter = getattr(data, 'getlist', lambda key: data.get(key, []))
        languages, words = getter(f'{name}_language'), getter(f'{name}_word')
        if isinstance(languages, str):
            languages = [languages]
        if isinstance(words, str):
            words = [words]
        if len(languages) != len(words):
            return [('', 'incomplete')]
        return list(zip(languages, words))

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        rows = list(value.items()) if isinstance(value, dict) else value
        rows = rows or [('', '')]
        context['widget']['rows'] = [{'language': language, 'word': word} for language, word in rows]
        languages = dict(self.languages)
        for language, _ in rows:
            if language and language not in languages:
                languages[language] = f'Mavjud til: {language}'
        context['widget']['languages'] = list(languages.items())
        return context


class EquivalentsField(forms.Field):
    widget = EquivalentsWidget

    def to_python(self, value):
        if not value:
            return {}
        pairs = value.items() if isinstance(value, dict) else value
        result = {}
        for language, word in pairs:
            language, word = language.strip(), word.strip()
            if not language and not word:
                continue
            if not language or not word:
                raise forms.ValidationError('Har bir qatorda tilni tanlang va muqobil so‘zni yozing.')
            if language in result:
                raise forms.ValidationError('Har bir tilni faqat bir marta tanlang.')
            result[language] = word
        return result


class MonumentAdminForm(forms.ModelForm):
    researchers = LinesField(label='Tadqiqotchilar', required=False,
                            help_text='Har bir tadqiqotchi ismini alohida qatorga yozing.')
    bibliography = LinesField(label='Adabiyotlar va manbalar', required=False,
                             help_text='Har bir manbani alohida qatorga yozing.')
    tags = LinesField(label='Kalit so‘zlar', required=False,
                      help_text='Har bir kalit so‘zni alohida qatorga yozing.')

    class Meta:
        model = Monument
        fields = '__all__'


class WordAdminForm(forms.ModelForm):
    equivalents = EquivalentsField(label='Turkiy tillardagi muqobillar', required=False,
                                  help_text='Tilni tanlang va shu tildagi muqobil so‘zni yozing.')

    class Meta:
        model = WordEntry
        fields = '__all__'
        labels = {'monument': 'Manba yodgorlik', 'status': 'So‘z turi', 'published': 'Saytda ko‘rsatish'}
