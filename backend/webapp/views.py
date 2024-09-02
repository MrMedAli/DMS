from django.contrib.auth.models import User
from rest_framework.parsers import JSONParser

import json
from django.http import Http404, HttpResponse, JsonResponse
from django.shortcuts import render , redirect , get_object_or_404
from django.contrib.auth.decorators import login_required 
from .models import *
from django.contrib import messages
from django.contrib.auth.models import auth       #fct to allow us to logout 
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth.models import Group
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth.hashers import make_password

from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from django.contrib.auth.models import User, Group
from django.contrib.auth.models import User, Group
from rest_framework.decorators import api_view
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework import status



@api_view(['GET', 'POST'])
def user_list(request):
    if request.method == 'GET':
        users = User.objects.all()
        user_data = []
        for user in users:
            group = user.groups.first()  # Assuming a user belongs to one group
            user_info = {
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'is_active': user.is_active,
                'date_joined': user.date_joined,
                'last_login': user.last_login,
                'role': group.name if group else 'None'
            }
            user_data.append(user_info)
        return Response(user_data)

    if request.method == 'POST':
        auth=request.user
        print("auth",auth)
        data = JSONParser().parse(request)
        username = data['username']
        password = data['password']
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        email = data.get('email', '')
        is_active = data.get('is_active', True)
        role = data.get('role', 'customer').lower()  # Default role is 'customer'

        # Create the user
        user = User.objects.create(
            username=username,
            first_name=first_name,
            last_name=last_name,
            email=email,
            is_active=is_active
        )
        user.set_password(password)
        user.save()

        # Assign the user to the specified role
        if role == 'admin':
            group, created = Group.objects.get_or_create(name='admin')
        else:
            group, created = Group.objects.get_or_create(name='customer')
        user.groups.add(group)
        
        response_data = {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'is_active': user.is_active,
            'date_joined': user.date_joined,
            'last_login': user.last_login,
            'role': group.name  # Adding the role to the response
        }
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    
    


@api_view(['POST'])
def register(request):
    data = request.data
    username = data.get('username')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    password1 = data.get('password1')
    password2 = data.get('password2')

    if not username or not password1 or not password2 or not email or not first_name or not last_name:
        return Response({'error': 'Please provide all required fields.'}, status=status.HTTP_400_BAD_REQUEST)

    if password1 != password2:
        return Response({'error': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create(
        username=username,
        first_name=first_name,
        last_name=last_name,
        email=email,
        password=make_password(password1)
    )

    try:
        group = Group.objects.get(name='customer')
        user.groups.add(group)
    except Group.DoesNotExist:
        return Response({'error': 'Customer group does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
        
    return Response({'message': 'User created successfully.'}, status=status.HTTP_201_CREATED)

    

    
@api_view(['GET', 'PUT', 'DELETE'])
def user_detail(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        group = user.groups.first()  # Assuming a user belongs to one group
        response_data = {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'is_active': user.is_active,
            'date_joined': user.date_joined,
            'last_login': user.last_login,
            'role': group.name if group else 'None'
        }
        return Response(response_data)

    if request.method == 'PUT':
        data = JSONParser().parse(request)
        user.username = data.get('username', user.username)
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        user.is_active = data.get('is_active', user.is_active)
        if 'password' in data:
            user.set_password(data['password'])  # Make sure to hash the password

        role = data.get('role', None)
        if role:
            user.groups.clear()  # Remove the user from any existing groups
            if role.lower() == 'admin':
                group, created = Group.objects.get_or_create(name='admin')
            else:
                group, created = Group.objects.get_or_create(name='customer')
            user.groups.add(group)

        user.save()
        
        group = user.groups.first()  # Assuming a user belongs to one group
        response_data = {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'is_active': user.is_active,
            'date_joined': user.date_joined,
            'last_login': user.last_login,
            'role': group.name if group else 'None'
        }
        return Response(response_data)

    if request.method == 'DELETE':
        user.delete()
        return Response({'message': 'User deleted'}, status=status.HTTP_204_NO_CONTENT)





class UserRoleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        userid = request.user.id

        print("userid",userid)
        user = request.user
        print("request user",user)

        role = 'admin' if user.groups.filter(name='admin').exists() else 'customer'
        print("request user",user.groups.filter(name='admin').exists())
        return Response({'username': user.username,'first_name': user.first_name,'last_name': user.last_name, 'role': role  ,  'userid': userid})


@api_view(['POST'])
def accounts_management(request):
    if request.user.groups.filter(name='admin').exists():
        accounts = User.objects.all()
    else:
        accounts = User.objects.filter(username=request.user.username)

    accounts_data = [{
        'id': account.id,
        'username': account.username,
        'first_name': account.first_name,
        'last_name': account.last_name,
        'email': account.email,
        'password': account.password,
        'groups': list(account.groups.values_list('name', flat=True))
    } for account in accounts]

    print('Accounts Data:', accounts_data)
    return Response({'accounts': accounts_data })
