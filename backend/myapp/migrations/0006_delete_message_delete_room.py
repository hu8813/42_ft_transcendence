
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0005_room_message'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Message',
        ),
        migrations.DeleteModel(
            name='Room',
        ),
    ]
