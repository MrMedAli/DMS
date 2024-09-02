from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Organization  ,Dataset ,Req_Access_Control ,GrpOfUsers,GrpOfDataset
from django.contrib.auth.models import Group
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.db import connection
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q



class CreateOrganizationView(APIView):
    def post(self, request):
        user = request.user
        data = request.data
        name = data.get('name')
        description = data.get('description')
        maintainer_username = data.get('maintainer_username')  # Adjusted field name
        creator_email = data.get('creator_email')
        maintainer_email = data.get('maintainer_email')

        # Check if required fields are present
        if not name or not maintainer_username:
            return Response({'error': 'Name and maintainer are required fields.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            maintainer = User.objects.get(username=maintainer_username)
        except User.DoesNotExist:
            return Response({'error': 'Maintainer not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        if Organization.objects.filter(name=name).exists():
            return Response({'error': 'Organization name already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create organization
        organization = Organization.objects.create(
            name=name,
            description=description,
            creator=user,
            maintainer=maintainer,
            creator_email=creator_email,
            maintainer_email=maintainer_email
        )
        organization.save()

        return Response({'message': 'Organization created successfully'}, status=status.HTTP_201_CREATED)
    

    

    def get(self, request):
        # if request.user.groups.filter(name='admin').exists():
        #     print('test',request)
        orgs = Organization.objects.all()
        # else:
        #     orgs = Organization.objects.filter(
        #         creator=request.user
        #     ) | Organization.objects.filter(
        #         maintainer=request.user
        #     )
        #     print("eee", orgs)

        organization_list = [{
            'id': org.id,
            'name': org.name,
            'created_at': org.created_at,
            'description': org.description,
            'creator_username': org.creator.username if org.creator else None,
            'creator_email': org.creator_email,
            'maintainer_email': org.maintainer_email,
            # 'datasets': ', '.join([(dataset.title) for dataset in org.datasets.all()]) if org.datasets.exists() else None,
            'maintainer': org.maintainer.username if org.maintainer else None,
        } for org in orgs]
      
        print("organization_list", organization_list)
        return Response(organization_list, status=status.HTTP_200_OK)


    
class OrgSearchView(APIView):
    permission_classes = [IsAuthenticated]  # Require authentication

    def get(self, request, format=None):
        search_query = request.GET.get('search', '')
        org = Organization.objects.all()

        if search_query:
            object_list = org.filter(name__icontains=search_query)
        else:
            object_list = org

        results = []
        for result in object_list:
            result_data = {
                'id': result.id,
                'name': result.name,
                'created_at': result.created_at,
                'description': result.description,
                'creator_email': result.creator_email,
                'maintainer_email': result.maintainer_email,
                # 'datasets': ', '.join([dataset.title for dataset in result.datasets.all()]) if result.datasets.exists() else None,
                'maintainer_username': result.maintainer.username if result.maintainer else None,
            }

            # Fetch creator username
            creator = result.creator
            result_data['creator_username'] = creator.username if creator else None

            results.append(result_data)

        return Response({'results': results}, status=status.HTTP_200_OK)
    
    


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_datasets_to_organization(request, organization_id):
    print('ooooooo:')

    try:
        print('Request Data:', request.data)
        organization = get_object_or_404(Organization, id=organization_id)
        user = request.user
        # org_name = organization.name

        is_admin = user.groups.filter(name='admin').exists()

        # Initialize has_permission based on creator, maintainer, or admin role
        has_permission = organization.creator == user or organization.maintainer == user or is_admin
        print('Initial has_permission:', has_permission)

        user_group_ids = []
        print('ttt ooo:')
         # Get the groups of the logged-in user
        user_groups = GrpOfUsers.objects.filter(members=user)
        user_group_ids = user_groups.values_list('id', flat=True)
        print('user_group_ids:', list(user_group_ids))

        # if he is  not the creator or the maintainer of the organisation check if he has a permission on organization management
        if not has_permission:          
            # Check if the user has the permission 'can_add_data_in_org' in any of their groups
            has_permission_to_organization = Req_Access_Control.objects.filter(
                Q(org_id=organization_id) &
                Q(permission__codename='add_dataset_in_org') &
                Q(action='accept') &
                (Q(user=user) | Q(grp_users_id__in=user_group_ids))
            ).exists()
            print('has_permission_to_organization:', has_permission_to_organization)

            # Update has_permission if the user has the required permission
            has_permission = has_permission_to_organization

        if not has_permission:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        dataset_ids = request.data.get('dataset_ids', [])
        print('dataset_ids', dataset_ids)
       # Check if the organization is owned by the user
        is_mine_organization = organization.creator == user or organization.maintainer == user
        if not isinstance(dataset_ids, list):
            return Response({'error': 'dataset_ids must be a list'}, status=status.HTTP_400_BAD_REQUEST)

        for dataset_id in dataset_ids:
            dataset = get_object_or_404(Dataset, id=dataset_id)
            db_title = dataset.title

            if not (dataset.Creator_id == user.id or dataset.maintainer_id == user.id or is_admin):
                has_permission_to_dataset = Req_Access_Control.objects.filter(
                    Q(data_id=dataset_id) &
                    Q(permission__codename='add_dataset_to_org') &
                    Q(action='accept') &
                    (Q(user=user) | Q(grp_users_id__in=user_group_ids))
                ).exists()
                print('has_permission_to_dataset:', has_permission_to_dataset)

                if not has_permission_to_dataset:
                    return Response(
                      {
                      'error': f'You need to ask permission on dataset "{db_title}"',
                      'is_mine_organization': is_mine_organization
                      },
                   status=status.HTTP_403_FORBIDDEN
                   )

        # Assign datasets to the organization
        datasets = Dataset.objects.filter(id__in=dataset_ids)
        datasets.update(organization=organization)
      

        return Response({'status': 'Datasets assigned successfully',
                         'is_mine_organization': is_mine_organization}, status=status.HTTP_200_OK)

    except Organization.DoesNotExist:
        return Response({'error': 'Organization not found'}, status=status.HTTP_404_NOT_FOUND)
    except Dataset.DoesNotExist:
        return Response({'error': 'One or more datasets not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)









@api_view(['GET'])
def get_datasets_by_organization(request, org_id):
    try:        
         # Fetch datasets for the given organization
        datasets = Dataset.objects.filter(organization_id=org_id)
        
        # Check if datasets exist
        if not datasets:
            return JsonResponse({'error': 'No datasets found for this organization'}, status=404)
        
        dataset_data = []
        
        for dataset in datasets:
            dataset_dict = {
                'id': dataset.id,
                'title': dataset.title,
                'link': dataset.link,
                'creator_email': dataset.creator_email,
                'creation_date': dataset.creation_date,
                'description': dataset.description,
                'source_of_data': dataset.source_of_data,
                'version': dataset.version,
                'file': dataset.file.url if dataset.file else None,
                'format': dataset.format,
                'File_name': dataset.File_name,
                'creator_username': dataset.Creator.username,
                'maintainer': dataset.maintainer.username,
                'maintainer_email': dataset.maintainer_email
            }
            
            # Print the file value to the console
            print(f"Dataset ID: {dataset.id}, File: {dataset_dict['file']}")
            
            dataset_data.append(dataset_dict)
        
        return JsonResponse(dataset_data, safe=False, status=200)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
    
    
@api_view(['GET'])
def get_datasets_by_user(request):
    user=request.user
    try:        
        if request.user.groups.filter(name='admin').exists():
            datasets=Dataset.objects.all()
        else:
            datasets = Dataset.objects.filter(Q(maintainer_id=user.id) | Q(Creator_id=user.id))
        
        # Check if datasets exist
        if not datasets:
            return JsonResponse({'error': 'No datasets found for this user'}, status=404)
        
        dataset_data = []
        
        for dataset in datasets:
            dataset_dict = {
                'id': dataset.id,
                'title': dataset.title,
                'link': dataset.link,
                'creator_email': dataset.creator_email,
                'creation_date': dataset.creation_date,
                'description': dataset.description,
                'source_of_data': dataset.source_of_data,
                'version': dataset.version,
                'file': dataset.file.url if dataset.file else None,
                'format': dataset.format,
                'File_name': dataset.File_name,
                'creator_username': dataset.Creator.username,
                'maintainer': dataset.maintainer.username,
                'maintainer_email': dataset.maintainer_email
            }
            
            # Print the file value to the console
            print(f"Dataset ID: {dataset.id}, File: {dataset_dict['file']}")
            
            dataset_data.append(dataset_dict)
        
        return JsonResponse(dataset_data, safe=False, status=200)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
    
    
    
    
    
    
    
    
    
    
    
    
    
from django.core.exceptions import ObjectDoesNotExist
  
class OrganizationUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request, pk):
        try:
            organization = Organization.objects.get(pk=pk)
        except Organization.DoesNotExist:
            return Response({'can_update_organization': False, 'error': 'Organization not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check if the user has permission to update the organization
        user = request.user
        has_change_permission = Req_Access_Control.objects.filter(
            org_id=pk,
            user=user,
            permission__codename='change_organization',
            action='accept'
        ).exists()
        
        can_update_organization = has_change_permission or (
            organization.creator == user or
            user.is_staff or  # Admin check
            organization.maintainer == user  # Maintainer check
        )

        # Print the permission check result
        print(f"User {user} can update organization {pk}: {can_update_organization}")

        if not can_update_organization:
            return Response({'can_update_organization': False, 'error': 'You do not have permission to update this organization'}, status=status.HTTP_403_FORBIDDEN)

        # Update organization fields based on request data
        data = request.data
        organization.name = data.get('name', organization.name)
        organization.description = data.get('description', organization.description)
        organization.creator_email = data.get('creator_email', organization.creator_email)
        organization.maintainer_email = data.get('maintainer_email', organization.maintainer_email)

        maintainer_id = data.get('maintainer_username')
        if maintainer_id:
            try:
                maintainer = User.objects.get(username=maintainer_id)
                organization.maintainer = maintainer
            except User.DoesNotExist:
                return Response({'can_update_organization': False, 'error': 'Maintainer not found'}, status=status.HTTP_404_NOT_FOUND)

        dataset_ids = data.get('datasets', [])
        if dataset_ids:
            try:
                datasets = Dataset.objects.filter(id__in=dataset_ids)
                organization.datasets.set(datasets)
            except ObjectDoesNotExist:
                return Response({'can_update_organization': False, 'error': 'One or more datasets not found'}, status=status.HTTP_404_NOT_FOUND)

        organization.save()
        return Response({'can_update_organization': True, 'message': 'Organization updated successfully'}, status=status.HTTP_200_OK)
    
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
    
def can_update_organization(request, org_id):
    user = request.user
    try:
        organization = Organization.objects.get(pk=org_id)
    except Organization.DoesNotExist:
        return JsonResponse({'can_update': False, 'error': 'Organization not found'}, status=404)

    has_change_permission = Req_Access_Control.objects.filter(
        org_id=org_id,
        user=user,
        permission__codename='change_organization',
        action='accept'
    ).exists()

    can_update = has_change_permission or (
        organization.creator == user or
        user.is_staff or
        organization.maintainer == user
    )

    print(f"User {user} can update organization {org_id}: {can_update}")
    return JsonResponse({'can_update': can_update})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_org(request, pk):
    org = get_object_or_404(Organization, id=pk)
    print(org)
    is_creator = org.creator.id == request.user.id
    print("is_creator", is_creator)
    is_maintainer = org.maintainer.id == request.user.id
    print("is_maintainer", is_maintainer)

    has_permission = Req_Access_Control.objects.filter(
        org_id=pk, user=request.user, permission__codename='delete_organization', action='accept'
    ).exists()
    print("has_permission", has_permission)

    is_admin = request.user.groups.filter(name='admin').exists()
    print("is_admin", is_admin)

    if is_creator or is_maintainer or has_permission or is_admin:
        org.delete()
        return Response({"message": "Organization deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    else:
        return Response({"message": "You do not have permission to delete this organization"}, status=status.HTTP_403_FORBIDDEN)





@api_view(['GET'])
@permission_classes([IsAuthenticated])
def count_requests(request):
    user = request.user
    is_admin = user.groups.filter(name='admin').exists()

    if is_admin:
        org_requests_count = Req_Access_Control.objects.filter(org__isnull=False).count()
        dataset_requests_count = Req_Access_Control.objects.filter(data__isnull=False).count()
    else:
        org_requests_count = Req_Access_Control.objects.filter(creator=user, org__isnull=False).count()
        dataset_requests_count = Req_Access_Control.objects.filter(creator=user, data__isnull=False).count()
    print('org_requests_count',org_requests_count)
    print('dataset_requests_count',dataset_requests_count)

    if org_requests_count > 0 or dataset_requests_count > 0:
        return JsonResponse({
            'org_requests_message': f'{org_requests_count}' ,
            'dataset_requests_message': f'{dataset_requests_count} '
        })
    else:
        return JsonResponse({'message': 'No requests found'}, status=404)

    
    
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def count_auth_users(request):
    # Count the number of users in the User table
    user_count = User.objects.count()

    return Response({'user_count': user_count})




class DatasetCountPerOrganization(APIView):
    def get(self, request):
        organizations = Organization.objects.all()
        data = []

        for org in organizations:
            dataset_count = Dataset.objects.filter(organization=org).count()
            if dataset_count > 0:
                data.append({
                    'organization': org.name,
                    'dataset_count': dataset_count
                })

        return Response(data) 
    

from .models import GrpOfDataset
from django.db import models

class DatasetCountPerGroupView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        group_data = GrpOfDataset.objects.all().annotate(dataset_count=models.Count('datasets'))
        response_data = [
            {"group_name": group.name, "dataset_count": group.dataset_count}
            for group in group_data
        ]
        return Response(response_data)
    
    

class FileCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        is_admin = user.groups.filter(name='admin').exists()
        print('is_admin',is_admin)
        if is_admin:  # Admin or staff
            user_files = Dataset.objects.all().count()
            print('is_admin',user_files)

            return Response({'user_files_count': user_files}, status=status.HTTP_200_OK)
        else:
            user_files = Dataset.objects.filter(Creator=user).count()
            print('user_files',user_files)
            return Response({'user_files_count': user_files}, status=status.HTTP_200_OK)