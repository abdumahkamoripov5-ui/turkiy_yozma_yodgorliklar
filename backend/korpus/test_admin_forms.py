from django.forms.models import model_to_dict
from django.test import TestCase
from .admin_forms import MonumentAdminForm, WordAdminForm
from .models import Monument, WordEntry


class PlainAdminFormsTests(TestCase):
    def test_monument_lists_show_plain_text_and_save_as_lists(self):
        monument = Monument.objects.create(title='Test', year=732, location='Test', script='koktürk',
            category='bitiglar', description='Test', researchers=['Researcher A', 'Researcher B'],
            bibliography=['Edition 1'], tags=['Old Turkic'])
        self.assertEqual(MonumentAdminForm(instance=monument)['researchers'].value(),
                         'Researcher A\nResearcher B')
        data = {**model_to_dict(monument), 'researchers': ' Researcher A\n\nResearcher C ',
                'bibliography': 'Edition 2\nEdition 3', 'tags': ''}
        form = MonumentAdminForm(data=data, instance=monument)
        self.assertTrue(form.is_valid(), form.errors)
        form.save()
        monument.refresh_from_db()
        self.assertEqual(monument.researchers, ['Researcher A', 'Researcher C'])
        self.assertEqual(monument.bibliography, ['Edition 2', 'Edition 3'])
        self.assertEqual(monument.tags, [])

    def word_data(self, **extra):
        return {'word': 'el', 'meaning': 'People', 'source': 'Edition', 'status': 'historical', **extra}

    def test_word_equivalents_use_rows_and_save_without_json_input(self):
        form = WordAdminForm(data=self.word_data(equivalents_language=['uz', 'tr'],
                                                equivalents_word=['el', 'il']))
        self.assertTrue(form.is_valid(), form.errors)
        word = form.save()
        self.assertEqual(word.equivalents, {'uz': 'el', 'tr': 'il'})
        rendered = WordAdminForm(instance=word)['equivalents'].as_widget()
        self.assertNotIn('<textarea', rendered)
        self.assertIn('selected>Turkcha', rendered)
        self.assertIn('value="il"', rendered)

    def test_empty_rows_are_optional_and_partial_or_duplicate_rows_rejected(self):
        form = WordAdminForm(data=self.word_data(equivalents_language=[''], equivalents_word=['']))
        self.assertTrue(form.is_valid(), form.errors)
        self.assertEqual(form.save().equivalents, {})
        for languages, words in [(['tr'], ['']), (['tr', 'tr'], ['el', 'il']), (['tr', 'uz'], ['el'])]:
            form = WordAdminForm(data=self.word_data(equivalents_language=languages, equivalents_word=words))
            self.assertFalse(form.is_valid())
            self.assertIn('equivalents', form.errors)

    def test_existing_other_languages_and_html_are_preserved_and_escaped(self):
        word = WordEntry.objects.create(word='el', meaning='People', source='Edition',
                                        equivalents={'custom-lang': '<script>alert(1)</script>'})
        rendered = WordAdminForm(instance=word)['equivalents'].as_widget()
        self.assertIn('custom-lang', rendered)
        self.assertNotIn('<script>', rendered)
        form = WordAdminForm(data=self.word_data(equivalents_language=['custom-lang'],
                            equivalents_word=['<script>alert(1)</script>']), instance=word)
        self.assertTrue(form.is_valid(), form.errors)
        form.save()
        word.refresh_from_db()
        self.assertEqual(word.equivalents, {'custom-lang': '<script>alert(1)</script>'})
