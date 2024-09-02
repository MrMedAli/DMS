
# from django.contrib import admin
# from django.urls import path,include

# urlpatterns = [
    
#     path('',include('webapp.urls')), #we mean when you run also look at all the urls that created on the django app , gonna work by "include"    
#     path('admin/', admin.site.urls),
# ]
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    
    path('admin/', admin.site.urls),

    path('', include('webapp.urls')),
]