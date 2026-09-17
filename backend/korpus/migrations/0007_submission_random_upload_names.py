from django.db import migrations, models

import korpus.models


class Migration(migrations.Migration):

    dependencies = [
        ('korpus', '0006_monumentsubmission_full_text'),
    ]

    operations = [
        migrations.AlterField(
            model_name='monumentsubmission',
            name='document',
            field=models.FileField(blank=True, null=True, upload_to=korpus.models.submission_document_path,
                                   verbose_name='Hujjat (PDF/Word/boshqa)'),
        ),
        migrations.AlterField(
            model_name='monumentsubmission',
            name='image_file',
            field=models.ImageField(blank=True, null=True, upload_to=korpus.models.submission_image_path,
                                    verbose_name='Rasm fayli (yuklash)'),
        ),
    ]
