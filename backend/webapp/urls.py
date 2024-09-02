from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import user_list, user_detail

from .viewsdb import (
    DatasetList, check_dataset_permission, download_dataset,
    DatasetSearchView, RequestCountView, delete_request_view,
    RequestResponseCount, GetUserDetails, get_users,
    DatasetDetail, DatasetUpdateView, AskPermissionView,
    ReqAccessControlDetail, DatasetDetailAPIView,create_req_access_control,DatasetPermissionRequestView,OrganizationPermissionRequestView
)
from .viewsorg import (
    CreateOrganizationView, OrgSearchView, assign_datasets_to_organization,
    get_datasets_by_organization, OrganizationUpdateView, delete_org,
    can_update_organization,get_datasets_by_user,count_requests,count_auth_users,
    DatasetCountPerOrganization,DatasetCountPerGroupView,FileCountView
)
from .viewsgrp_user import GrpOfUsersCreateView, GrpOfUsersDetailView, GrpDetailView,generate_json

from .viewsGrpDB import (CreateGrpOfDataset , assign_dataset_to_grp , get_data_from_join_table ,get_grpofdataset_details,RemoveDatasetFromGrpView ,assign_grp_dataset_to_org,
                          add_dataset_to_group ,dataset_groups,DataList)

urlpatterns = [
    # Dataset related paths
    path('api/datasets/', DatasetList.as_view(), name='dataset-list'),
    path('api/create_req_access_control/<int:pk>', DatasetList.as_view(), name='dataset-list'),

    path('api/datasets/<int:pk>/organizations/<int:organization_id>/', DatasetDetail.as_view(), name='dataset-detail'),
    path('api/search_db/', DatasetSearchView.as_view(), name='dataset-search'),
    path('api/update-data/<int:pk>/', DatasetDetailAPIView.as_view(), name='update-data'),
    path('api/datasets/<int:pk>/update/', DatasetUpdateView.as_view(), name='dataset-update'),
    path('api/datasets/<int:dataset_id>/download/', download_dataset, name='download_dataset'),
    path('api/check_dataset_permission/<int:id>/', check_dataset_permission, name='check_permission'),

    # Organization related paths
    path('api/create-organization/', CreateOrganizationView.as_view(), name='create_organization'),
    path('api/search_org/', OrgSearchView.as_view(), name='org-search'),
    path('api/update-organization/<int:pk>/', OrganizationUpdateView.as_view(), name='update-organization'),
    path('api/delete_org/<int:pk>/', delete_org, name='delete_org'),
    path('api/can_update_organization/<int:org_id>/', can_update_organization, name='delete_request'),
    path('api/organizations/<int:organization_id>/assign-datasets/', assign_datasets_to_organization, name='assign-datasets'),
    path('api/org-datasets/<int:org_id>/', get_datasets_by_organization, name='get-datasets-from-join-table'),
    path('api/datasets-by-user/', get_datasets_by_user, name='get-datasets-by-user'),
    path('api/count-requests/', count_requests, name='count_requests'),
    path('api/count-auth-users/', count_auth_users, name='count_auth_users'),
    path('api/dataset-count-per-organization/', DatasetCountPerOrganization.as_view(), name='dataset-count-per-organization'),
    path('api/dataset-count-per-group/', DatasetCountPerGroupView.as_view(), name='dataset-count-per-group'),
    path('api/file-count/', FileCountView.as_view(), name='file-count'),




    # Group of Users related paths
    path('api/groups/', GrpOfUsersCreateView.as_view(), name='create_group'),
    path('api/group_details/<int:grp_id>/', GrpDetailView.as_view(), name='group_details'),
    path('api/groups/<int:group_id>/', GrpOfUsersDetailView.as_view(), name='group-detail'),
    path('api/generate-json/', generate_json, name='generate_json'),

    # Request and Permission related paths
    path('api/ask_db_permission/', AskPermissionView.as_view(), name='ask_db_permission'),
    
    path('api/ask_db_permission/<int:db_id>/', DatasetPermissionRequestView.as_view(), name='ask_dataset_permission'),
    path('api/ask_org_permission/<int:db_id>/', OrganizationPermissionRequestView.as_view(), name='ask_organization_permission'),
    
    
    
    path('api/request_count/<str:type>/<int:id>/', RequestCountView.as_view(), name='request_count_api'),
    path('api/user_requests/<int:user_id>/', RequestResponseCount.as_view(), name='user-requests-list'),
    path('api/delete-request/<int:request_id>/', delete_request_view, name='delete_request'),
    path('api/req_access_controls/<str:type>/<int:id>/', ReqAccessControlDetail.as_view(), name='req_access_controls_api'),
    path('api/req_access_controls/<int:req_id>/', ReqAccessControlDetail.as_view(), name='req_access_control_update'),

    # User related paths
    path('api/get-user-details/', GetUserDetails.as_view(), name='get-user-details'),
    path('api/users/', get_users, name='get_users'),
    path('users/', user_list, name='user-list'),
    path('users/<int:pk>/', user_detail, name='user-detail'),

    # JWT Authentication paths
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),


#views grpdata

    path('api/create_grp_of_dataset/', CreateGrpOfDataset.as_view(), name='create_grp_of_dataset'),
    path('api/assign_dataset_to_grp/<int:grp_data_id>/', assign_dataset_to_grp, name='assign_dataset_to_grp'),

    path('api/get_assigned_datasets/<int:grp_db_id>/', get_data_from_join_table, name='get-datasets-from-join-table'),
    path('api/grpofdataset/<int:id>/', get_grpofdataset_details, name='get_grpofdataset_details'),
    path('api/create_grp_of_dataset/<int:pk>/', CreateGrpOfDataset.as_view(), name='create_grp_of_dataset'),
    path('api/remove_dataset_from_grp/', RemoveDatasetFromGrpView.as_view(), name='remove_dataset_from_grp'),
    path('api/assign_grp_dataset_to_org/', assign_grp_dataset_to_org, name='assign_grp_dataset_to_org'),
    path('api/add_dataset_to_group/', add_dataset_to_group, name='add_dataset_to_group'),
    path('api/dataset_groups/<int:dataset_id>/', dataset_groups, name='dataset-groups'),
    path('api/datasets_list/', DataList.as_view(), name='dataset-list'),


















    # viewsold related paths
    # path('', viewsold.home, name=""),
    path('api/register/', views.register, name='register'),
    path('api/accounts_management/', views.accounts_management, name='accounts_management'),
    path('api/users/role/', views.UserRoleView.as_view(), name='user-role'),
    # path('api/update_account/<int:account_id>/', viewsold.update_account, name='update_account'),

]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)