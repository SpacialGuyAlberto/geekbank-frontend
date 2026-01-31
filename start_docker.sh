#!/bin/bash
echo "Cleaning macOS system files (._*) from external drive..."
find . -name "._*" -delete
echo "Starting Docker containers..."
docker compose up --build
