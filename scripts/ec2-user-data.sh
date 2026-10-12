#!/bin/bash
# Script de démarrage EC2 (Amazon Linux 2023), à coller dans
# "Advanced details > User data" au lancement de l'instance.
# Il installe Docker, télécharge l'image publiée (docker pull, AUCUNE reconstruction)
# et lance le site sur le port 80 de l'instance.
#
# Image publiée sur le compte Docker Hub leti1006.
set -euo pipefail

IMAGE="leti1006/ivoiremarket:v1"

dnf update -y
dnf install -y docker
systemctl enable --now docker
usermod -aG docker ec2-user

docker pull "$IMAGE"
docker rm -f ivoiremarket 2>/dev/null || true
docker run -d \
  --name ivoiremarket \
  --restart unless-stopped \
  -p 80:3000 \
  "$IMAGE"
