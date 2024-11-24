from django.urls import path
from . import views

urlpatterns = [
    path('list/', views.list_directory, name='list_directory'),
    path('read/', views.read_file, name='read_file'),
    path('write/', views.write_file, name='write_file'),
    path('create-dir/', views.create_directory, name='create_directory'),
    path('delete/', views.delete_path, name='delete_path'),
    path('rename/', views.rename_path, name='rename_path'),
]
