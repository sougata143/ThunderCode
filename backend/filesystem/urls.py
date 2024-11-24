from django.urls import path
from . import views

urlpatterns = [
    path('list-directory/', views.list_directory, name='list_directory'),
    path('read-file/', views.read_file, name='read_file'),
    path('write-file/', views.write_file, name='write_file'),
    path('create-directory/', views.create_directory, name='create_directory'),
    path('delete-path/', views.delete_path, name='delete_path'),
    path('rename-path/', views.rename_path, name='rename_path'),
    path('load-local-folder/', views.load_local_folder, name='load_local_folder'),
]
