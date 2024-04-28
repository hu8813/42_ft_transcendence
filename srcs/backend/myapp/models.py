from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.utils import timezone

class MyAppUser(AbstractUser):
    score = models.IntegerField(default=0)
    nickname = models.CharField(max_length=50, blank=True, null=True)
    image_link = models.URLField(null=True, blank=True)
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)  
    blocked_users = models.ManyToManyField('self', symmetrical=False, related_name='blocked_by', blank=True) 
    two_factor_enabled = models.BooleanField(default=False)
    activation_code = models.CharField(max_length=255, blank=True, null=True)
    is_oauth_user = models.BooleanField(default=True)
    games_played = models.IntegerField(default=0)  
    games_won = models.IntegerField(default=0)  
    games_lost = models.IntegerField(default=0)
    is_online = models.BooleanField(default=False) 

    class Meta:
        managed = True
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
    user = models.ForeignKey(MyAppUser, on_delete=models.CASCADE)
    games_played = models.IntegerField(default=0)
    games_won = models.IntegerField(default=0)
    games_lost = models.IntegerField(default=0)
    tournaments_won = models.IntegerField(default=0)
    favorite_game = models.CharField(max_length=100, blank=True, null=True)
    date_time_played = models.DateTimeField(default=timezone.now)
    opponent = models.CharField(max_length=100,default='cpu')
    game_type = models.CharField(max_length=100,default='pong')

    def __str__(self):
        return f"Achievement for {self.user.username} on {self.date_time_played}"

class MyAppUserGroups(models.Model):
    user = models.ForeignKey(MyAppUser, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)

    class Meta:
        db_table = 'myapp_user_groups'

class MyAppUserPermissions(models.Model):
    user = models.ForeignKey(MyAppUser, on_delete=models.CASCADE)
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)

    class Meta:
        db_table = 'myapp_user_permissions'

class Tournament(models.Model):
    name = models.CharField(max_length=100, default='pong42')
    saved_date = models.DateField(default=timezone.now) 
    winner = models.CharField(max_length=100, default='')
    matches = models.TextField(default='')  

    class Meta:
        db_table = 'tournaments'

class UserProfile(models.Model):
    user = models.OneToOneField(MyAppUser, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    nickname = models.CharField(max_length=100)

    def __str__(self):
        return self.user.username

class Player(models.Model):
    name = models.CharField(max_length=100)
    position_x = models.IntegerField(default=0)
    position_y = models.IntegerField(default=0)

class WaitingPlayer(models.Model):
    user = models.OneToOneField(MyAppUser, on_delete=models.CASCADE)

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
    owner = models.ForeignKey(MyAppUser, on_delete=models.CASCADE)
    moderator = models.ForeignKey(MyAppUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='moderator_channels')
    password = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.name

class GameStats(models.Model):
    user = models.ForeignKey(MyAppUser, on_delete=models.CASCADE)
    opponent = models.CharField(max_length=100)  # Name of the opponent or "CPU"
    win = models.BooleanField()  # True if the user won, False if lost
    date_time_played = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} vs. {self.opponent} - {"Won" if self.win else "Lost"}'
