# Transcendence

## Work in Progress..

### Frontend: React
The frontend is built using React and can be accessed at [Transcendence Frontend](https://transcendence-beige.vercel.app/). You can deploy the frontend on Vercel.

### Backend: Django
The backend is implemented in Django. You can find the code at [Transcendence Backend](https://github.com/hu8813/transcendence_backend). Both the backend and PostgreSQL database can be deployed on Render.com.

### Saving Leaderboard on Blockchain
Leaderboard data is saved on the Sepolia Testnet on Ethereum. Contracts are created via [Remix Ethereum](https://remix.ethereum.org/) using the Sepolia fork.

### Sample Environment Variables for Saving Passwords:
To securely save passwords, follow these steps:

1. Save the following environment variables in either `~/.bashrc` or `~/.zshrc`:

```bash
export DB_HOST=either-localhost-or-url-at.render.com
export DB_NAME=dbname
export DB_USER=username
export DB_PASSWORD=dbpassword
export DJANGO_SECRET_KEY="your-django-secret-here"
```
