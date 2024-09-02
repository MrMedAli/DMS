from django.db import migrations

def update_permissions(apps, schema_editor):
    Permission = apps.get_model('auth', 'Permission')
    ContentType = apps.get_model('contenttypes', 'ContentType')

    content_type_10 = ContentType.objects.get(id=10) #Organization table id 
    content_type_7 = ContentType.objects.get(id=7) #Dataset table id 

    Permission.objects.update_or_create(
        name="can add dataset to org",
        defaults={'content_type': content_type_7}, 
        codename="add_dataset_to_org"
    )
    Permission.objects.update_or_create(
        name="can add dataset to grp",
        defaults={'content_type': content_type_7},
        codename="add_dataset_to_grp"
    )
    Permission.objects.update_or_create(
        name="can add dataset in org",
        defaults={'content_type': content_type_10},
        codename="add_dataset_in_org"
    )

class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'), 
        ('webapp', '0003_add_default_permissions'), 
    ]

    operations = [
        migrations.RunPython(update_permissions),
    ]

