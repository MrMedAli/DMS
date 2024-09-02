from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User 
from .models import GrpOfDataset,Dataset,Organization,Req_Access_Control , GrpOfUsers
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.db import connection
from django.http import JsonResponse
from django.db.models import Q





class DataList(APIView):  

    def get(self, request):
            # Check if the user is admin
            # if request.user.groups.filter(name='admin').exists():
            datasets = Dataset.objects.all()
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
        
        
        
        
        
        
        
        
class CreateGrpOfDataset(APIView):
    def post(self, request):
        try:
            name = request.data.get('name')
            description = request.data.get('description', '')
            creator_id = request.user.id 
            creator_email = request.data.get('creator_email', '')

            if not name:
                return Response({'error': 'Name is required'}, status=status.HTTP_400_BAD_REQUEST)

            creator = None
            if creator_id:
                try:
                    creator = User.objects.get(id=creator_id)
                except User.DoesNotExist:
                    return Response({'error': 'Invalid creator ID'}, status=status.HTTP_400_BAD_REQUEST)

            grp_of_dataset = GrpOfDataset.objects.create(
                name=name,
                description=description,
                creator=creator,
                creator_email=creator_email
            )

            return Response({
                'id': grp_of_dataset.id,
                'name': grp_of_dataset.name,
                'description': grp_of_dataset.description,
                'creator_id': grp_of_dataset.creator.id if grp_of_dataset.creator else None,
                'creator_email': grp_of_dataset.creator_email,
                'creation_date': grp_of_dataset.creation_date
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        
    def delete(self, request, pk): 
        try:
            grp_of_dataset = GrpOfDataset.objects.get(id=pk)
            grp_of_dataset.delete()  # Delete the object
            return Response({"message": "Group of dataset deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except GrpOfDataset.DoesNotExist:
            return Response({"error": "Group of dataset not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

                

    def put(self, request, pk):
        try:
            grp_of_dataset = GrpOfDataset.objects.get(pk=pk)

            name = request.data.get('name', grp_of_dataset.name)
            description = request.data.get('description', grp_of_dataset.description)
            creator_email = request.data.get('creator_email', grp_of_dataset.creator_email)

            grp_of_dataset.name = name
            grp_of_dataset.description = description
            grp_of_dataset.creator_email = creator_email

            grp_of_dataset.save()

            return Response({
                'id': grp_of_dataset.id,
                'name': grp_of_dataset.name,
                'description': grp_of_dataset.description,
                'creator_id': grp_of_dataset.creator.id if grp_of_dataset.creator else None,
                'creator_email': grp_of_dataset.creator_email,
                'creation_date': grp_of_dataset.creation_date
            }, status=status.HTTP_200_OK)

        except GrpOfDataset.DoesNotExist:
            return Response({'error': 'GrpOfDataset not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        
                
    def get(self, request):
        grp_datasets = GrpOfDataset.objects.all()
        data = [
            {
                'id': dataset.id,
                'name': dataset.name,
                'description': dataset.description,
                'creator': dataset.creator.username if dataset.creator else None,
                'creator_email': dataset.creator_email,
            }
            for dataset in grp_datasets
        ]
        return Response(data, status=status.HTTP_200_OK)  # Removed `safe=False`




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_dataset_to_grp(request, grp_data_id):
    try:
        # Fetch the grp_of_dataset object
        grp_of_dataset = get_object_or_404(GrpOfDataset, id=grp_data_id)
        print('grp_of_dataset.creator', grp_of_dataset.creator)
        
        user = request.user
        print('user', user)
        is_admin = user.groups.filter(name='admin').exists()
        print("is_admin:", is_admin)
     
        # Get the group of the logged-in user
        user_groups = GrpOfUsers.objects.filter(members=user)
        user_group_ids = user_groups.values_list('id', flat=True)
        print('user_group_ids:', list(user_group_ids))

        dataset_ids = request.data.get('dataset_ids', [])
        datasets = Dataset.objects.filter(id__in=dataset_ids)
        print('datasets', datasets) 
        
        for dataset in datasets:
            db_title = dataset.title
            
            has_permission = dataset.Creator_id == user.id or dataset.maintainer_id == user.id or is_admin
            print('Initial has_permission:', has_permission)

            if not has_permission:
                # Check if the user has the permission 'add_dataset_to_grp' in any of their groups
                has_permission_to_dataset = Req_Access_Control.objects.filter(
                    Q(data_id=dataset.id) &
                    Q(permission__codename='add_dataset_to_grp') &
                    Q(action='accept') &
                    (Q(user=user) | Q(grp_users_id__in=user_group_ids))
                ).exists()
                print('has_permission_to_dataset:', has_permission_to_dataset)

                # Update has_permission if the user has the required permission
                has_permission = has_permission_to_dataset

            if not has_permission:
                return Response(
                    {'error': f'Permission denied for dataset "{db_title}"','db':{db_title}},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Assign datasets to the group of datasets
        grp_of_dataset.datasets.add(*datasets)  # Use add to keep existing datasets
        
        return Response({'status': 'Datasets assigned successfully'}, status=status.HTTP_200_OK)
    
    except GrpOfDataset.DoesNotExist:
        return Response({'error': 'Group of dataset not found'}, status=status.HTTP_404_NOT_FOUND)
    except Dataset.DoesNotExist:
        return Response({'error': 'One or more datasets not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)









@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_dataset_to_group(request):
    try:
        print("Request Data:", request.data)  # Log request data
        dataset_id = request.data.get('dataset_id')
        group_id = request.data.get('group_id')

        if not dataset_id or not group_id:
            return Response({"error": "Dataset ID and Group ID are required."}, status=status.HTTP_400_BAD_REQUEST)

        dataset = get_object_or_404(Dataset, id=dataset_id)
        print('db maintainer:', dataset.maintainer)

        group = get_object_or_404(GrpOfDataset, id=group_id)

        user = request.user
        is_admin = user.groups.filter(name='admin').exists()

        # Initialize has_permission based on creator, maintainer, or admin role
        has_permission = dataset.Creator_id == user.id or dataset.maintainer == user  or is_admin
        print('Initial has_permission:', has_permission)

        if not has_permission:
            # Get the groups of the logged-in user
            user_groups = GrpOfUsers.objects.filter(members=user)
            user_group_ids = user_groups.values_list('id', flat=True)
            print('user_group_ids:', list(user_group_ids))

            # Check if the user has the permission 'add_dataset_to_grp' in any of their groups
            has_permission_to_dataset = Req_Access_Control.objects.filter(
                Q(data_id=dataset_id) &
                Q(permission__codename='add_dataset_to_grp') &
                Q(action='accept') &
                (Q(user=user) | Q(grp_users_id__in=user_group_ids))
            ).exists()
            print('has_permission_to_dataset:', has_permission_to_dataset)

            # Update has_permission if the user has the required permission
            has_permission = has_permission_to_dataset

        if not has_permission:
            return Response(
                {'error': f'Permission denied for dataset "{dataset.title}"'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Assign the dataset to the group of datasets
        group.datasets.add(dataset)
        group.save()

        return Response({"message": "Dataset added to group successfully."}, status=status.HTTP_200_OK)

    except GrpOfDataset.DoesNotExist:
        return Response({'error': 'Group of dataset not found'}, status=status.HTTP_404_NOT_FOUND)
    except Dataset.DoesNotExist:
        return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)




    
    
    
    
    
    
# list of datas in grpdata selected
@api_view(['GET'])
def get_data_from_join_table(request, grp_db_id):
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT dataset_id FROM public.webapp_grpofdataset_datasets WHERE grpofdataset_id=%s', [grp_db_id])
            rows = cursor.fetchall()
        
        if not rows:
            return JsonResponse({'error': 'No datasets found for this organization'}, status=404)
        
        dataset_ids = [row[0] for row in rows]
        datasets = Dataset.objects.filter(id__in=dataset_ids)
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
    except Dataset.DoesNotExist:
        return JsonResponse({'error': 'Dataset not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
       
       
@api_view(["GET"])
def dataset_groups(request, dataset_id):
    try:
        groups = GrpOfDataset.objects.filter(datasets__id=dataset_id)
        group_list = [
            {
                'id': group.id,
                'name': group.name,
                'description': group.description,
                'creation_date': group.creation_date,
                'creator': group.creator.username,
                'creator_email': group.creator_email,
            }
            for group in groups
        ]
        return JsonResponse(group_list, safe=False, status=200)
    except GrpOfDataset.DoesNotExist:
        return JsonResponse({"detail": "Dataset or groups not found."}, status=404)
       
       
       
    
    
           
# single data details    
@api_view(['GET'])
def get_grpofdataset_details(request, id):
    try:
        grpofdataset = GrpOfDataset.objects.get(id=id)
    except GrpOfDataset.DoesNotExist:
        return Response({'error': 'Group of Dataset not found'}, status=status.HTTP_404_NOT_FOUND)

    datasets = grpofdataset.datasets.all()

    grp_data = {
        'id': grpofdataset.id,
        'name': grpofdataset.name,
        'creation_date': grpofdataset.creation_date,
        'description': grpofdataset.description,
        'creator': grpofdataset.creator.username if grpofdataset.creator else None,
        'creator_email': grpofdataset.creator_email,
        'datasets': []
    }

    for dataset in datasets:
        dataset_info = {
            'id': dataset.id,
            'title': dataset.title,
            'description': dataset.description
        }
        grp_data['datasets'].append(dataset_info)

    return Response(grp_data, status=status.HTTP_200_OK)






class RemoveDatasetFromGrpView(APIView):
    def delete(self, request, *args, **kwargs):
        grpdata_id = request.data.get('grpdata_id')
        dataset_id = request.data.get('dataset_id')

        if not grpdata_id or not dataset_id:
            return Response({'error': 'Both grpdata_id and dataset_id are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            grp_of_dataset = GrpOfDataset.objects.get(id=grpdata_id)
            dataset = Dataset.objects.get(id=dataset_id)
            user = request.user

            # Check if the user is the creator, the maintainer, or has the admin role
            is_creator = dataset.Creator_id == user.id
            is_maintainer = dataset.maintainer_id == user.id
            is_admin = user.groups.filter(name='admin').exists()

            if not (is_creator or is_maintainer or is_admin):
                return Response({'error': 'You do not have permission to remove this dataset from the group.'}, status=status.HTTP_403_FORBIDDEN)

            # Remove the association
            grp_of_dataset.datasets.remove(dataset)
            grp_of_dataset.save()

            return Response({'message': 'Dataset removed from group successfully.'}, status=status.HTTP_200_OK)
        
        except GrpOfDataset.DoesNotExist:
            return Response({'error': 'Group of dataset not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Dataset.DoesNotExist:
            return Response({'error': 'Dataset not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        
        
        
        
        
        
        
        
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_grp_dataset_to_org(request):
    organization_id = request.data.get('organization_id')
    grp_dataset_id = request.data.get('grp_dataset_id')
    
    if not organization_id or not grp_dataset_id:
        return JsonResponse({'error': 'organization_id and grp_dataset_id are required'}, status=400)

    organization = get_object_or_404(Organization, id=organization_id)
    grp_dataset = get_object_or_404(GrpOfDataset, id=grp_dataset_id)

    organization.grp_datasets.add(grp_dataset)
    return JsonResponse({'message': 'Group dataset assigned to organization successfully'})

