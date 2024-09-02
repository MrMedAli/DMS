from django.db import connections
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Dataset, GrpOfUsers, User,Dataset,Req_Access_Control,Organization
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from django.conf import settings
import os
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import FileResponse
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes

class DatasetList(APIView):  
    
  def get(self, request):
        # Check if the user is admin
        # if request.user.groups.filter(name='admin').exists():
        datasets = Dataset.objects.filter(organization_id__isnull=True)
        # else:
        #     datasets = Dataset.objects.filter(Creator_id=request.user) | Dataset.objects.filter(maintainer=request.user)

        datasets_list = [{
            'id': dataset.id,
            'title': dataset.title,
            'creation_date': dataset.creation_date,
            'link': dataset.link,
            'description': dataset.description,
            'source_of_data': dataset.source_of_data,
            'version': dataset.version,
            'file': dataset.file.url if dataset.file else None,
            'format': dataset.format,
            'File_name': dataset.File_name,
            'creator_username': dataset.Creator.username if dataset.Creator else None,
            'creator_email': dataset.creator_email,
            'maintainer': dataset.maintainer.username if dataset.maintainer else None,
            'maintainer_email': dataset.maintainer_email,
            'creator_id': dataset.Creator.id
        } for dataset in datasets]
        
        print("datasetlist",datasets_list)
        
        return Response(datasets_list, status=status.HTTP_200_OK)
      
      
      
      
      
  def post(self, request):
        print("reqreq",request)
        
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication credentials were not provided.'}, status=status.HTTP_403_FORBIDDEN)
        data = request.data
        url_validator = URLValidator()
        source_of_data = data.get('source_of_data', '')
        try:
            url_validator(source_of_data)
        except ValidationError:
            return Response({'error': 'Invalid URL provided for source_of_data.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            file = request.FILES.get('file')
           
            print('file', file)
            creator = request.user  # Get the User instance
            maintainer_id = data.get('maintainer')
            if maintainer_id:
                try:
                    maintainer = User.objects.get(username=maintainer_id)
                except User.DoesNotExist:
                    return Response({'error': 'Maintainer does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                maintainer = None
            dataset = Dataset.objects.create(
                title=data.get('title', ''),
                link=data.get('link', ''),
                description=data.get('description', ''),
                creator_email=data.get('creator_email', ''),
                maintainer=maintainer,  # Set the maintainer based on the ID
                source_of_data=source_of_data,
                version=data.get('version', ''),
                file=file,
                format=data.get('format', ''),
                File_name=data.get('File_name', ''),
                Creator=creator,  # Pass the User instance here
            )
            
            print("ddd",dataset.Creator)
            
            dataset.save()
            return Response({'id': dataset.id}, status=status.HTTP_201_CREATED)
        except KeyError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
      
      
      
class GetUserDetails(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        print("userjjj",user)
        print("userjjj",user.id)
        print("userjjj",user.username)
   
        return Response({'id': user.id, 'username': user.username})
 
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_dataset_permission(request, id):
    user = request.user
    user_groups = GrpOfUsers.objects.filter(members=user)
    user_group_ids = user_groups.values_list('id', flat=True)
    print('user_group_ids:', list(user_group_ids))
    
      
            
    try:
        dataset = Dataset.objects.get(pk=id)
    except dataset.DoesNotExist:
        return JsonResponse({'can_update': False, 'error': 'dataset not found'}, status=404)
    print("dataset",dataset)
    print("id: ",id)
    
    has_change_permission = Req_Access_Control.objects.filter(
                Q(data_id=id) &
                Q(permission__codename='change_dataset') &
                Q(action='accept') &
                (Q(user=user) | Q(grp_users_id__in=user_group_ids))
            ).exists()
    print('has_permission_to_dataset:', has_change_permission)
          
    can_update = has_change_permission or (
        dataset.Creator == user or
        user.is_staff or
        dataset.maintainer == user
    )

    print(f"User {user} can update dataset {id}: {can_update}")
    return JsonResponse({'can_update': can_update})




      
@api_view(['GET'])
def get_users(request):
    users = User.objects.values('id', 'username')  # Fetch user IDs and usernames
    print("qqqq",users)
    return Response({'users': list(users)})

class DatasetDetail(APIView):
    def delete(self, request, pk, organization_id):
        print('organization', organization_id, 'pk: ', pk)
        dataset = get_object_or_404(Dataset, id=pk)
        user = request.user

        # Debug statements
        print(f"Dataset ID: {pk}")
        print(f"User ID: {user.id}")
        print(f"Dataset Creator ID: {dataset.Creator_id}")
        print(f"Dataset Maintainer ID: {dataset.maintainer_id}")

        is_creator = dataset.Creator_id == user.id
        is_maintainer = dataset.maintainer_id == user.id
        has_permission = Req_Access_Control.objects.filter(
            data_id=pk,
            user=user,
            permission__codename='delete_dataset',
            action='accept'
        ).exists()
        is_admin = user.groups.filter(name='admin').exists()

        print(f"Is Creator: {is_creator}")
        print(f"Is Maintainer: {is_maintainer}")
        print(f"Has Permission: {has_permission}")
        print(f"Is Admin: {is_admin}")

        if organization_id != 0:
            try:
                organization = Organization.objects.get(id=organization_id)
            except Organization.DoesNotExist:
                return Response({"error": "Organization not found."}, status=status.HTTP_404_NOT_FOUND)

            Iamthecreator = organization.creator_id == user.id
        else:
            Iamthecreator = False

        # Check if user has permission to delete dataset
        if not (is_creator or is_maintainer or has_permission or is_admin or Iamthecreator):
            print("Permission check failed")
            return Response({"message": "You do not have permission to delete this dataset"}, status=status.HTTP_403_FORBIDDEN)

        if organization_id != 0:
            # Delete the association between the dataset and the organization
            with connections['default'].cursor() as cursor:
                cursor.execute("""
                    UPDATE webapp_dataset
                    SET organization_id = null
                    WHERE id = %s
                """, [ pk])
            print("Association between dataset and org deleted successfully")
        else:
            print("Case of delete dataset without organization link")
            dataset.delete()

        return Response({"message": "Dataset deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    
    
        
        
        
        
        
        
        
        
class DatasetDetailAPIView(APIView):
    
    def put(self, request, pk):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication credentials were not provided.'}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data
        print('data', data)
        url_validator = URLValidator()
        source_of_data = data.get('source_of_data', '')
        
        try:
            url_validator(source_of_data)
        except ValidationError:
            return Response({'error': 'Invalid URL provided for source_of_data.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            dataset = get_object_or_404(Dataset, pk=pk)
            
            # Update dataset fields based on request data
            dataset.title = data.get('title', dataset.title)
            dataset.link = data.get('link', dataset.link)
            dataset.description = data.get('description', dataset.description)
            dataset.creator_email = data.get('creator_email', dataset.creator_email)
            dataset.source_of_data = source_of_data
            dataset.version = data.get('version', dataset.version)
            dataset.format = data.get('format', dataset.format)
            dataset.File_name = data.get('File_name', dataset.File_name)
            
            maintainer_id = data.get('maintainer')
            if maintainer_id:
                try:
                    maintainer = User.objects.get(id=maintainer_id)
                    dataset.maintainer = maintainer
                except User.DoesNotExist:
                    return Response({'error': 'Maintainer does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                dataset.maintainer = None
            
            dataset.save()
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
class DatasetUpdateView(APIView):
    # permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def put(self, request, pk):
        # dataset = get_object_or_404(Dataset, pk=pk)
        dataset=Dataset.objects.get(pk=pk)
        print(dataset.maintainer)
        
        dataset.title = request.data.get('title', dataset.title)
        dataset.Creator = request.data.get('Creator', dataset.Creator)
        dataset.link = request.data.get('link', dataset.link)
        dataset.creator_email = request.data.get('creator_email', dataset.creator_email)
        dataset.description = request.data.get('description', dataset.description)
        dataset.source_of_data = request.data.get('source_of_data', dataset.source_of_data)
        dataset.version = request.data.get('version', dataset.version)
        dataset.file = request.data.get('file', dataset.file)
        dataset.format = request.data.get('format', dataset.format)
        dataset.File_name = request.data.get('File_name', dataset.File_name)
        maintainer_id = request.data.get('maintainer')


        if maintainer_id:
                try:
                    maintainer = User.objects.get(username=maintainer_id)
                except User.DoesNotExist:
                    return Response({'error': 'Maintainer does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
                maintainer = None
        dataset.maintainer_email = request.data.get('maintainer_email', dataset.maintainer_email)
        dataset.maintainer=maintainer
        dataset.save()
        return  Response({'message': 'Dataset updated successfully', 'data': {
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
            'Creator': dataset.Creator.id if dataset.Creator else None,
            'maintainer': dataset.maintainer.id if dataset.maintainer else None,
            'maintainer_email': dataset.maintainer_email,
        }})
        
        
        
        
import mimetypes
from django.db.models import Q



@api_view(['GET'])
def download_dataset(request, dataset_id):
    dataset = get_object_or_404(Dataset, id=dataset_id)
    user = request.user  
    user_groups = GrpOfUsers.objects.filter(members=user)
    user_group_ids = user_groups.values_list('id', flat=True)
    print('user_group_ids:', list(user_group_ids))   
       
    print('user', user.id) 
    is_creator = dataset.Creator_id == user.id
    is_maintainer = dataset.maintainer_id == user.id
    print(f"Is Creator: {is_creator}")
    print(f"Is Maintainer: {is_maintainer}")


    has_view_permission = Req_Access_Control.objects.filter(
                Q(data_id=dataset_id) &
                Q(permission__codename='view_dataset') &
                Q(action='accept') &
                (Q(user=user) | Q(grp_users_id__in=user_group_ids))
            ).exists()
    print('has_permission_to_dataset:', has_view_permission)


   

    is_admin = user.groups.filter(name='admin').exists()
    print(f"Is Admin: {is_admin}")

    # Fetch all organizations associated with the user
    organizations = Organization.objects.filter(creator_id=user)
    print(f"Organizations: {organizations}")

    # If you expect multiple organizations and want to work with all of them
    organization_ids = [org.id for org in organizations]
    print(f"Organization IDs: {organization_ids}")

    # Check if there's an association between any of the user's organizations and the dataset
    if organization_ids:
        with connections['default'].cursor() as cursor:
            cursor.execute("""
                SELECT 1
                FROM webapp_dataset
                WHERE organization_id IN %s AND id = %s
            """, [tuple(organization_ids), dataset_id])
            data_in_org = cursor.fetchone() is not None
    else:
        data_in_org = False
    
    print(f"Data in Organization: {data_in_org}")

    if is_creator or is_maintainer or has_view_permission or is_admin:
        has_perm = True
    else:
        with connections['default'].cursor() as cursor:
            cursor.execute("""
                SELECT organization_id 
                FROM public.webapp_dataset
                WHERE id = %s;
            """, [dataset_id])
            dataset_organization_ids = [row[0] for row in cursor.fetchall()]
        print(f"Dataset Organization IDs: {dataset_organization_ids}")

        can_view_in_organization = Req_Access_Control.objects.filter(
            org_id__in=dataset_organization_ids,
            user=user,
            permission__codename='view_organization',
            action='accept'
        ).exists()
        print(f"Can View in Organization: {can_view_in_organization}")

        has_perm = can_view_in_organization or data_in_org

    print(f"Has Permission: {has_perm}")

    if has_perm:
        file_path = os.path.join(settings.MEDIA_ROOT, dataset.file.name)
        print(f"File path: {file_path}")
        try:
            if not os.path.exists(file_path):
                print(f"File does not exist at: {file_path}")
                return Response({"message": "File not found"}, status=status.HTTP_404_NOT_FOUND)
            response = FileResponse(open(file_path, 'rb'), as_attachment=True)
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
            return response
        except Exception as e:
            print(f"Error: {str(e)}")
            return Response({"message": f"Failed to download file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        return Response({"message": "You do not have permission to download this dataset"}, status=status.HTTP_403_FORBIDDEN)

    

    
    
    
    
    
class DatasetSearchView(APIView):
    permission_classes = [IsAuthenticated]  # Require authentication

    def get(self, request, format=None):
        search_query = request.GET.get('search', '')
        dbs = Dataset.objects.all()

        if search_query:
            object_list = dbs.filter(title__icontains=search_query)
        else:
            object_list = dbs

        results = list(object_list.values('id', 'title', 'creation_date', 'file','link','format','description','File_name', 'Creator_id','version','maintainer_id','source_of_data','creator_email','maintainer_email'))
        for result in results:
            creator_id = result.get('Creator_id')
            if creator_id:
                creator = User.objects.filter(id=creator_id).first()
                result['creator_username'] = creator.username if creator else None
            else:
                result['creator_username'] = None
            maintainer_id = result.get('maintainer_id')    
            if maintainer_id:
                        maintainer = User.objects.filter(id=maintainer_id).first()
                        result['maintainer'] = maintainer.username if maintainer else None
            else:
                        result['maintainer'] = None
        return Response({'results': results})





class DatasetPermissionRequestView(APIView):
    def post(self, request, db_id):
        user = request.user
        db_obj = Dataset.objects.filter(id=db_id).first()

        if db_obj is not None:
            permission_name_id = request.data.get('permission_name', None)
            grp_id = request.data.get('grp_id', None)

            if permission_name_id is not None:
                permission_id = int(permission_name_id)
                creator_username = db_obj.Creator.username if db_obj.Creator else None

                # Check if request.user is admin of any group, get the list of group members
                admin_groups = GrpOfUsers.objects.filter(admin_grp=user)
                all_members = set()
                for group in admin_groups:
                    all_members.update(group.members.all())
                member_usernames = [member.username for member in all_members]

                if creator_username:
                    response_data = {
                        'message': f"Request sent to {creator_username}",
                        'group_members': member_usernames
                    }
                else:
                    return Response({'error': 'Creator username not found.'}, status=400)
                
                grp_users = GrpOfUsers.objects.filter(id=grp_id).first() if grp_id else None

                req_access_control = Req_Access_Control.objects.create(
                    user=user,
                    data=db_obj,
                    permission_id=permission_id,
                    creator=db_obj.Creator,
                    maintainer=db_obj.maintainer,
                    action='non_action',
                    grp_users=grp_users
                )
                req_access_control.save()

                return Response(response_data, status=status.HTTP_200_OK)

        return Response({'error': 'Dataset id and permission_name are required.'}, status=400)




class OrganizationPermissionRequestView(APIView):
    def post(self, request, db_id):
        user = request.user
        db_obj = Organization.objects.filter(id=db_id).first()

        if db_obj is not None:
            permission_name_id = request.data.get('permission_name', None)
            grp_id = request.data.get('grp_id', None)

            if permission_name_id is not None:
                permission_id = int(permission_name_id)
                creator_username = db_obj.creator.username if db_obj.creator else None

                # Check if request.user is admin of any group, get the list of group members
                admin_groups = GrpOfUsers.objects.filter(admin_grp=user)
                all_members = set()
                for group in admin_groups:
                    all_members.update(group.members.all())
                member_usernames = [member.username for member in all_members]

                if creator_username:
                    response_data = {
                        'message': f"Request sent to {creator_username}",
                        'group_members': member_usernames
                    }
                else:
                    return Response({'error': 'Creator username not found.'}, status=400)
                
                grp_users = GrpOfUsers.objects.filter(id=grp_id).first() if grp_id else None

                req_access_control = Req_Access_Control.objects.create(
                    user=user,
                    org=db_obj,
                    permission_id=permission_id,
                    creator=db_obj.creator,
                    maintainer=db_obj.maintainer,
                    action='non_action',
                    grp_users=grp_users
                )
                req_access_control.save()

                return Response(response_data, status=status.HTTP_200_OK)

        return Response({'error': 'Organization id and permission_name are required.'}, status=400)



class AskPermissionView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
            data_type = request.query_params.get('type', 'dataset')  # Default to 'dataset' if no type is specified
            user = request.user
            print("vdata_type",data_type)

            # Check if request.user is admin of any group, get the list of group names
            admin_groups = GrpOfUsers.objects.filter(admin_grp=user)
            print("grps",admin_groups)
            group_names = [group.name for group in admin_groups]

            if data_type == 'organization':
                data_objects = Organization.objects.all()
                data_titles = [{"id": org.id, "title": org.name} for org in data_objects]
                print("data_titles",data_titles)

                content_type_id = ContentType.objects.get_for_model(Organization).id
                print("content_type_id",content_type_id)

            else:  
                data_objects = Dataset.objects.all()
                data_titles = [{"id": dataset.id, "title": dataset.title} for dataset in data_objects]
                content_type_id = ContentType.objects.get_for_model(Dataset).id

            permissions = Permission.objects.filter(content_type_id=content_type_id)
            permission_names = [{"id": perm.id, "name": perm.name} for perm in permissions]
            print("permission_names",permission_names)
            print("org/dbtitle",data_titles)

            return Response({
                "data_titles": data_titles,
                "permission_names": permission_names,
                "group_names": group_names,  
            })
    
    # def post(self, request, db_id):
    #     user = request.user
    #     print("user",user)
    #     # Try to get Dataset object
    #     db_obj = Dataset.objects.filter(id=db_id).first()
    #     is_dataset = True
    #     print("is_dataset",is_dataset)
    #     if db_obj is None:
    #         # If not found, try to get Organization object
    #         db_obj = Organization.objects.filter(id=db_id).first()
    #         is_dataset = False
    #         print("is_dataset",is_dataset)

    #     print("db_obj",db_obj)
        
    #     if db_obj is not None:
    #         permission_name_id = request.data.get('permission_name', None)
    #         grp_id = request.data.get('grp_id', None)  # Get the grp_id from the request data
    #         print("permission_name_id", permission_name_id)

    #         if permission_name_id is not None:
    #             permission_id = int(permission_name_id)
    #             print("permission_id", permission_id)
    #             creator_username = None

    #             if is_dataset:
    #                 creator_username = db_obj.Creator.username if db_obj.Creator else None
    #             else:
    #                 creator_username = db_obj.creator.username if db_obj.creator else None

    #             # Check if request.user is admin of any group, get the list of group members
    #             admin_groups = GrpOfUsers.objects.filter(admin_grp=user)
    #             print('admin_groups', admin_groups)
    #             all_members = set()
    #             for group in admin_groups:
    #                 print('group', group)
    #                 all_members.update(group.members.all())
    #                 print('all_members', all_members)
    #             member_usernames = [member.username for member in all_members]

    #             if creator_username:
    #                 response_data = {
    #                     'message': f"Request sent to {creator_username}",
    #                     'group_members': member_usernames
    #                 }
    #             else:
    #                 response_data = {
    #                     'error': 'Creator username not found.'
    #                 }
    #                 return Response(response_data, status=400)
                
    #             # Retrieve the selected group
    #             grp_users = None
    #             if grp_id:
    #                 grp_users = GrpOfUsers.objects.filter(id=grp_id).first()

    #             req_access_control = Req_Access_Control.objects.create(
    #                 user=user,
    #                 org=db_obj if not is_dataset else None,
    #                 data=db_obj if is_dataset else None,
    #                 permission_id=permission_id,
    #                 creator=db_obj.Creator if is_dataset else db_obj.creator,
    #                 maintainer=db_obj.maintainer if is_dataset else db_obj.maintainer,
    #                 action='non_action',
    #                 grp_users=grp_users  # Set the grp_users field
    #             )
    #             print('req_access_control',req_access_control)
    #             req_access_control.save()
    #             print('req_access_control',req_access_control.action)

    #             return Response(response_data, status=status.HTTP_200_OK)

    #     return Response({'error': 'Both dataset/organization id and permission_name are required.'}, status=400)



class ReqAccessControlDetail(APIView):
    def get(self, request, id, type):
        print("test for get req")
        print(f"here id <{id}, typ{type}")

        # Determine which filter to apply based on the type
        if type == 'dataset':
            access_controls = Req_Access_Control.objects.filter(data_id=id)
        elif type == 'org':
            access_controls = Req_Access_Control.objects.filter(org_id=id)
        else:
            return Response({'error': 'Invalid type provided'}, status=400)
        
        print('access_controls', access_controls)

        # Fetch the group names and prepare the response data
        data = []
        for req in access_controls:
            # Fetch the group name based on grp_users_id
            group_name = None
            if req.grp_users_id:
                try:
                    group = GrpOfUsers.objects.get(id=req.grp_users_id)
                    group_name = group.name
                except GrpOfUsers.DoesNotExist:
                    group_name = None
            
            # Prepare the response data
            req_data = {
                'id': req.id,
                'user': req.user.username,
                'org': req.org.name if req.org else None,
                'permission': req.permission.name,
                'creator': req.creator.username,
                'maintainer': req.maintainer.username,
                'action': req.action,
                'data': req.data.title if req.data else None,
                'grp_users': group_name,
            }
            data.append(req_data)
        
        print("rrrr", data)
        return Response(data)

    
    def put(self, request, req_id):
        try:
            # Retrieve the Req_Access_Control instance
            req_access_control = Req_Access_Control.objects.get(id=req_id)
            
            # Update the action field based on request data
            action = request.data.get('action')
            if action not in ['accept', 'deny','non_action']:
                return Response({'error': 'Invalid action value'}, status=status.HTTP_400_BAD_REQUEST)
            
            req_access_control.action = action
            req_access_control.save()
            
            # Optionally, return updated data
            data = {
                'id': req_access_control.id,
                'user': req_access_control.user.username,
                'org': req_access_control.org.name if req_access_control.org else None,
                'permission': req_access_control.permission.name,
                'creator': req_access_control.creator.username,
                'maintainer': req_access_control.maintainer.username,
                'action': req_access_control.action,
                'data': req_access_control.data.title if req_access_control.data else None,
            }
            
            return Response(data, status=status.HTTP_200_OK)
        
        except Req_Access_Control.DoesNotExist:
            return Response({'error': 'Req_Access_Control not found'}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    


# request count
class RequestCountView(APIView):
    def get(self, request, id, type):
        print(f"{type}_id:", id)

        if type == 'dataset':
            dbid = Req_Access_Control.objects.filter(data=id)
            action = Req_Access_Control.objects.filter(data=id, action='non_action')
        elif type == 'org':
            dbid = Req_Access_Control.objects.filter(org=id)
            action = Req_Access_Control.objects.filter(org=id, action='non_action')
        else:
            return Response({'error': 'Invalid type provided'}, status=status.HTTP_400_BAD_REQUEST)

        print("dbid:", dbid)
        print("action:", action)

        try:
            request_count = action.count()  # Count the filtered queryset
            print("request_count:", request_count)
            return Response({'request_count': request_count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    
    
    
class RequestResponseCount(APIView):
    def get(self, request, user_id):
        print("id user :", user_id)
        try:
            # Filter requests for datasets (where org is None)
            dataset_requests = Req_Access_Control.objects.filter(user_id=user_id, org__isnull=True)
            print('rrrrrr')
            dataset_request_count = dataset_requests.count()
            print("dataset_request_count", dataset_request_count)
            
            # Filter requests for organizations (where dataset is None)
            org_requests = Req_Access_Control.objects.filter(user_id=user_id, data__isnull=True)
            org_request_count = org_requests.count()
            print("org_request_count", org_request_count)

            # Fetch group name based on grp_users_id
            def get_group_name(grp_users_id):
                try:
                    group = GrpOfUsers.objects.get(id=grp_users_id)
                    return group.name
                except GrpOfUsers.DoesNotExist:
                    return None

            # Prepare dataset request list
            dataset_request_list = [{
                'id': req.id,
                'user': req.user.username,
                'org': req.org.name if req.org else None,
                'permission': req.permission.name,
                'creator': req.creator.username,
                'maintainer': req.maintainer.username,
                'action': req.action,
                'data': req.data.title if req.data else None,
                'grp_users': get_group_name(req.grp_users_id)  # Get group name
            } for req in dataset_requests]
            print("Dataset request list:", dataset_request_list)

            # Prepare organization request list
            org_request_list = [{
                'id': req.id,
                'user': req.user.username,
                'org': req.org.name if req.org else None,
                'permission': req.permission.name,
                'creator': req.creator.username,
                'maintainer': req.maintainer.username,
                'action': req.action,
                'data': req.data.title if req.data else None,
                'grp_users': get_group_name(req.grp_users_id)  # Get group name
            } for req in org_requests]
            print("Organization request list:", org_request_list)

            # Prepare response data
            response_data = {
                'dataset_request_count': dataset_request_count,
                'org_request_count': org_request_count,
                'dataset_requests': dataset_request_list,
                'org_requests': org_request_list
            }

            print("response db", response_data)
            
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            print("Error:", str(e))
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




        
            
        
@api_view(['DELETE'])

def delete_request_view(request, request_id):
    if request.method == 'DELETE':
        # Attempt to get the request object by ID
        request_obj = get_object_or_404(Req_Access_Control, id=request_id)
        
        # Delete the request object
        request_obj.delete()
        
        return Response({'message': f'Request with ID {request_id} deleted successfully.'}, status=204)
    else:
        return Response({'error': 'Method not allowed.'}, status=405)
    
    
    
@api_view(['POST'])
def create_req_access_control(request, db_id):
    user = request.user
    permission_id = request.data.get('permission_id')
    action = 'No_Action'
    organizations = request.data.get('organizations')
    grp_data = request.data.get('grp_data')

    # Initialize the data field
    data = None

    # Look up the dataset by db_id
    try:
        data = Dataset.objects.get(id=db_id)
    except Dataset.DoesNotExist:
        return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)

    # Check if the request is for a dataset_groupe or an organization
    if organizations and not grp_data:
        grp_data = None
    elif not organizations and grp_data:
        organizations = None
    else:
        # return Response({'error': 'Invalid combination of organizations and group of dataset'}, status=status.HTTP_400_BAD_REQUEST)
        organizations =None 
        grp_data= None

    # Create the Req_Access_Control instance
    req_access_control = Req_Access_Control(
        user=user,
        permission_id=permission_id,
        creator=user,  # Assuming the creator is the same as the user for simplicity
        maintainer=user,  # Assuming the maintainer is the same as the user for simplicity
        action=action,
        data=data,
        organizations=organizations,
        grp_data=grp_data
    )

    # Save the instance
    req_access_control.save()

    # Prepare the response data
    response_data = {
        'user': user.username,
        'permission_id': permission_id,
        'creator': user.username,
        'maintainer': user.username,
        'action': action,
        'data': data.id,
        'organizations': organizations,
        'grp_data': grp_data
    }

    return Response(response_data, status=status.HTTP_201_CREATED)

