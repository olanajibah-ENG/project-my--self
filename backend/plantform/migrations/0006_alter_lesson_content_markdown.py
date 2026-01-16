# Generated manually to make content_markdown optional

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('plantform', '0005_alter_course_description'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lesson',
            name='content_markdown',
            field=models.TextField(blank=True, default=''),
        ),
    ]
