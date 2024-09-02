from django.db import migrations

def add_default_permissions(apps, schema_editor):
    Permission = apps.get_model('auth', 'Permission')
    ContentType = apps.get_model('contenttypes', 'ContentType')

    content_type_10 = ContentType.objects.get(id=10)
    content_type_7 = ContentType.objects.get(id=7)

    Permission.objects.get_or_create(
        name="can add dataset to org",
        content_type=content_type_7,
        codename="add_dataset_to_org"
    )
    Permission.objects.get_or_create(
        name="can add dataset to grp",
        content_type=content_type_7,
        codename="add_dataset_to_grp"
    )
    Permission.objects.get_or_create(
        name="can add dataset in org",
        content_type=content_type_10,
        codename="add_dataset_in_org"
    )

class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),  # Adjust as needed
        ('webapp', '0002_add_default_groups'),  # Adjust to your latest migration
    ]

    operations = [
        migrations.RunPython(add_default_permissions),
    ]
