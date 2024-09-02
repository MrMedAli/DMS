from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import GrpOfUsers , User 
from rest_framework.decorators import api_view
from django.http import  HttpResponse
import json     



class GrpOfUsersCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        name = request.data.get('name')
        members = request.data.get('members', [])

        if not name:
            return Response({'error': 'Name is required'}, status=status.HTTP_400_BAD_REQUEST)

        grp_of_users = GrpOfUsers.objects.create(name=name, admin_grp=request.user)
        grp_of_users.members.add(request.user)  # Add the admin as a member

        for member in members:
            try:
                # Determine if the member is an integer (ID) or a string (username)
                if isinstance(member, int):
                    user = User.objects.get(id=member)
                else:
                    user = User.objects.get(username=member)
                grp_of_users.members.add(user)
            except User.DoesNotExist:
                return Response({'error': f'User with identifier {member} does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'id': grp_of_users.id,
            'name': grp_of_users.name,
            'admin_grp': grp_of_users.admin_grp.id,
            'members': [user.username for user in grp_of_users.members.all()]
        }, status=status.HTTP_201_CREATED)

        
    def get(self, request):
        if request.user.groups.filter(name='admin').exists():
            groups = GrpOfUsers.objects.all()
        else:
            groups = GrpOfUsers.objects.filter(admin_grp=request.user)

        groups_data = []
        for group in groups:
            group_data = {
                'id': group.id,
                'name': group.name,
                'admin_grp': group.admin_grp.username,
                'members': [member.username for member in group.members.all()]
            }
            groups_data.append(group_data)
            print("My groups",groups_data)
        return Response(groups_data, status=status.HTTP_200_OK)







class GrpDetailView(APIView):
    def get(self, request, grp_id):
        try:
            # Check if the user is an admin or the group's admin
            if request.user.groups.filter(name='admin').exists():
                group = GrpOfUsers.objects.get(id=grp_id)
            else:
                group = GrpOfUsers.objects.get(id=grp_id, admin_grp=request.user)
            
            # Prepare the group data
            group_data = {
                'id': group.id,
                'name': group.name,
                'admin_grp': group.admin_grp.username,
                'members': [member.username for member in group.members.all()]
            }
            print("group_data^^",group_data)
            
            return Response(group_data, status=status.HTTP_200_OK)
        
        except GrpOfUsers.DoesNotExist:
            return Response({'detail': 'Group not found or access denied.'}, status=status.HTTP_404_NOT_FOUND)



class GrpOfUsersDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, group_id):
        try:
            group = GrpOfUsers.objects.get(id=group_id)
        except GrpOfUsers.DoesNotExist:
            return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.user != group.admin_grp and not request.user.groups.filter(name='admin').exists():
            return Response({'error': 'You are not authorized to update this group'}, status=status.HTTP_403_FORBIDDEN)

        name = request.data.get('name', group.name)
        members = request.data.get('members', [member.username for member in group.members.all()])

        if not name:
            return Response({'error': 'Name is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            group.name = name
            group.save()

            group.members.clear()

            for identifier in members:
                try:
                    # Determine if the identifier is an integer (ID) or a string (username)
                    if isinstance(identifier, int):
                        member = User.objects.get(id=identifier)
                    else:
                        member = User.objects.get(username=identifier)
                    group.members.add(member)
                except User.DoesNotExist:
                    return Response({'error': f'User with identifier {identifier} does not exist'}, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                'id': group.id,
                'name': group.name,
                'admin_grp': group.admin_grp.id,
                'members': [user.username for user in group.members.all()]
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
         
         
         
         
         
    def delete(self, request, group_id):
        try:
            group = GrpOfUsers.objects.get(id=group_id)
        except GrpOfUsers.DoesNotExist:
            return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.user != group.admin_grp and not request.user.groups.filter(name='admin').exists():
            return Response({'error': 'You are not authorized to delete this group'}, status=status.HTTP_403_FORBIDDEN)

        group.delete()
        return Response({'message': 'Group deleted successfully'}, status=status.HTTP_200_OK)
     
     
     

@api_view(['POST'])
def generate_json(request):
    try:
        keys = request.data.get('key', [])
        values = request.data.get('value', [])
        response_data = dict(zip(keys, values))
        
        response = HttpResponse(json.dumps(response_data), content_type='application/json')
        response['Content-Disposition'] = 'attachment; filename="data.json"'
        return response
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)