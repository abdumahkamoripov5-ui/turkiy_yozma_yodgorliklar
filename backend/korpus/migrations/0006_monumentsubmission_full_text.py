from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('korpus', '0005_loginactivity'),
    ]

    operations = [
        migrations.AddField(
            model_name='monumentsubmission',
            name='full_text',
            field=models.TextField(blank=True, verbose_name="To'liq matn (ixtiyoriy)"),
        ),
    ]
