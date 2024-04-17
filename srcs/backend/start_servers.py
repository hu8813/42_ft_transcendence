# custom_runserver.py

import sys
from django.core.management.commands.runserver import Command as RunServerCommand

class Command(RunServerCommand):
    def add_arguments(self, parser):
        # Add custom arguments for SSL certificate and key
        parser.add_argument('--cert', help='Path to SSL certificate file')
        parser.add_argument('--key', help='Path to SSL key file')
        super().add_arguments(parser)

    def handle(self, *args, **options):
        cert_file = options.get('cert')
        key_file = options.get('key')

        # If SSL certificate and key are provided, use them
        if cert_file and key_file:
            self.stdout.write(self.style.NOTICE(f'Using SSL certificate: {cert_file}'))
            self.stdout.write(self.style.NOTICE(f'Using SSL key: {key_file}'))
            self.server_cert = cert_file
            self.server_key = key_file

        super().handle(*args, **options)

# Replace the default runserver command with our custom command
sys.argv[0] = "python manage.py runserver"
sys.argv.insert(1, 'runserver')

if __name__ == "__main__":
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)
