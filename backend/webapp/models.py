from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.models import Permission 








class Organization(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organizations_creator')
    creator_email = models.EmailField()
    maintainer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='org_maintainer')
    maintainer_email = models.CharField(max_length=255,default='tayebnihel123@gmail.com') 
    

    def __str__(self):
        return self.name
     
     
     






class Dataset(models.Model):
    title = models.CharField(max_length=255)
    link = models.CharField(max_length=255, unique=True)  
    creator_email = models.EmailField()
    creation_date = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True)
    source_of_data = models.URLField(max_length=200, default='https://drive.google.com/drive/folders/1SMoIKEbqYTU9ah6ne3xjCq_OO0kYk38F')
    version = models.CharField(default=2)
    file = models.FileField(upload_to='media/webapp/')
    format = models.CharField(max_length=255, null=True, blank=True)
    File_name = models.CharField(max_length=255, null=True, blank=True)
    Creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='creator',blank=True)
    maintainer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='datasets')
    maintainer_email = models.CharField(max_length=255,default='tayebnihel123@gmail.com')     
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True, related_name='ORGDB')
    def __str__(self):
        return self.title
     
     
     
     
     
     

class GrpOfDataset(models.Model):
    name = models.CharField(max_length=100)
    datasets = models.ManyToManyField(Dataset)
    creation_date = models.DateTimeField(auto_now_add=True)  # Automatically set the date when the object is created
    description = models.TextField(blank=True, null=True)  # Optional description field
    creator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)  # ForeignKey to User model
    creator_email = models.EmailField(max_length=254, blank=True, null=True)  # Optional email field
    
   
    def __str__(self):
        return self.name



class GrpOfUsers(models.Model):
    name = models.CharField(max_length=100 , unique=True )
    admin_grp= models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_groups_user')
    members = models.ManyToManyField(User, related_name='members')

    def __str__(self):
        return self.name    
    
    


class Req_Access_Control(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # ForeignKey to auth_user table
    org = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='org_req' , null=True, blank=True)  # Unique related_name for org , to_field='name'
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)  # ForeignKey to auth_permission table
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='creator_requests')  
    maintainer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='maintainer_requests')  # ForeignKey to auth_user table for creator
    action = models.CharField(max_length=200, choices=[('accept', 'Accept'), ('deny', 'Deny'),('non_action', 'No Action')])
    data = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='db_req', null=True, blank=True)  # Unique related_name for org , to_field='name'
    grp_users=models.ForeignKey(GrpOfUsers, on_delete=models.CASCADE, related_name='grp_users_req' , null=True, blank=True)
    
    


    def __str__(self):
        return f"Request ID: {self.id} - User: {self.user.username} "


