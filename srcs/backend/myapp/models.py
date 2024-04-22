from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission

class User(AbstractUser):
    score = models.IntegerField(default=0)
    nickname = models.CharField(max_length=50, blank=True, null=True)
    image_link = models.URLField(null=True, blank=True)
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)  
    blocked_users = models.ManyToManyField('self', symmetrical=False, related_name='blocked_by', blank=True) 
    two_factor_enabled = models.BooleanField(default=False)
    activation_code = models.CharField(max_length=255, blank=True, null=True)
    
    class Meta:
        managed = False
        db_table = 'auth_user'

    groups = models.ManyToManyField(
        Group,
        through='MyAppUserGroups',
        related_name='custom_user_groups',
        related_query_name='custom_user_group',
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        Permission,
        through='MyAppUserPermissions',
        related_name='custom_user_permissions',
        related_query_name='custom_user_permission',
        blank=True,
    )

class Achievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    games_played = models.IntegerField(default=0)
    games_won = models.IntegerField(default=0)
    games_lost = models.IntegerField(default=0)
    tournaments_won = models.IntegerField(default=0)
    favorite_game = models.CharField(max_length=100, blank=True, null=True)
    
class MyAppUserGroups(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)

    class Meta:
        db_table = 'myapp_user_groups'

class MyAppUserPermissions(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)

    class Meta:
        db_table = 'myapp_user_permissions'

class Tournament(models.Model):
    name = models.CharField(max_length=100)
    start_date = models.DateField()

    class Meta:
        db_table = 'tournaments'

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    nickname = models.CharField(max_length=100)

    def __str__(self):
        return self.user.username

class Player(models.Model):
    name = models.CharField(max_length=100)
    position_x = models.IntegerField(default=0)
    position_y = models.IntegerField(default=0)

class WaitingPlayer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.user.username

class Message(models.Model):
    name = models.CharField(max_length=100)
    text = models.TextField()
    recipient = models.CharField(max_length=100, blank=True, null=True)  
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.name}: {self.text}'

class Feedback(models.Model):
    feedback_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.feedback_text


class Channel(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    moderator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='moderator_channels')
    password = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.name