# Use the official Python image as a base image
FROM python:3.12.1-slim-bullseye

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /usr/src/app

# Install any dependencies required for Daphne
RUN pip install daphne

# Copy the Django project files into the container
COPY . .

# Expose port 8001
EXPOSE 8001

# Command to run Daphne
CMD ["daphne", "-p", "8001", "myproject.asgi:application"]
