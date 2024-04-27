from rest_framework import serializers
from .models import MyAppUser
from .models import Tournament

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyAppUser
        fields = '__all__'

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = ['id', 'name', 'start_date']