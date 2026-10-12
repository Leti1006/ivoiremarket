# Publication Docker Hub et déploiement AWS EC2

Remplacez `<username>` par votre identifiant Docker Hub. Aucune de ces commandes ne demande de mot de passe en clair dans un fichier : ne mettez jamais d'identifiants dans le dépôt Git.

## 1. Construire et tester l'image en local

```bash
docker build -t ivoiremarket:v1 .
docker run -d --name ivoiremarket -p 8080:3000 ivoiremarket:v1
docker ps                      # le statut doit passer à "(healthy)"
curl -I http://localhost:8080  # doit répondre HTTP/1.1 200 OK
BASE_URL=http://localhost:8080 npx playwright test
docker rm -f ivoiremarket
```

## 2. Publier sur Docker Hub

1. Créez un jeton d'accès sur Docker Hub : *Account settings > Personal access tokens* (droits *Read & Write*).
2. Connectez-vous ; collez le jeton quand le mot de passe est demandé :

```bash
docker login -u <username>
```

3. Construisez pour l'architecture des serveurs EC2 classiques (x86_64) et publiez.
   Cette commande fonctionne aussi depuis un Mac Apple Silicon (ARM), dont les images ne tourneraient pas sur une instance x86 sans l'option `--platform` :

```bash
docker buildx build --platform linux/amd64 -t <username>/ivoiremarket:v1 --push .
```

   Sur un PC Linux ou Windows x86, l'équivalent classique est :

```bash
docker tag ivoiremarket:v1 <username>/ivoiremarket:v1
docker push <username>/ivoiremarket:v1
```

4. Vérifiez sur https://hub.docker.com/r/<username>/ivoiremarket que le tag `v1` apparaît (dépôt public, pour que EC2 puisse le télécharger sans identifiants).

## 2 bis. Variante sans Docker sur votre ordinateur : publier depuis GitHub

Le dépôt contient un workflow qui construit, teste puis publie l'image pour `linux/amd64`. Il ne se lance **que** si vous cliquez dessus.

1. Docker Hub > *Account settings > Personal access tokens* : créez un jeton *Read & Write*.
2. GitHub > dépôt `ivoiremarket` > *Settings > Secrets and variables > Actions > New repository secret* :
   - `DOCKERHUB_USERNAME` : votre identifiant Docker Hub ;
   - `DOCKERHUB_TOKEN` : le jeton (jamais votre mot de passe).
3. Onglet *Actions* > *Publier sur Docker Hub* > *Run workflow* (tag `v1`).
4. Quand la coche est verte, l'image `<username>/ivoiremarket:v1` est sur Docker Hub. Le résumé de l'exécution l'indique.

## 3. Créer l'instance EC2

Console AWS > EC2 > *Lancer une instance* :

| Paramètre | Valeur |
| --- | --- |
| Image (AMI) | Amazon Linux 2023 (x86_64) |
| Type | `t2.micro` ou `t3.micro` (offre gratuite) |
| Paire de clés | Créez-en une et gardez le fichier `.pem` hors du dépôt |
| Stockage | 8 Go suffisent |

### Groupe de sécurité (ports ouverts au minimum)

| Type | Port | Source | Pourquoi |
| --- | --- | --- | --- |
| SSH | 22 | **Mon IP** uniquement | Administration |
| HTTP | 80 | 0.0.0.0/0 (et ::/0) | Accès public au site |

N'ouvrez **pas** le port 3000 : il reste interne, Docker relie le port 80 de l'hôte au port 3000 du conteneur.

### Raccourci : script de démarrage automatique

Au lancement de l'instance, dans *Advanced details > User data*, collez le contenu de [`scripts/ec2-user-data.sh`](../scripts/ec2-user-data.sh) (il utilise déjà `leti1006/ivoiremarket:v1`). L'instance installera Docker, fera le `docker pull` et lancera le site toute seule. Patientez 2 à 3 minutes, puis passez directement à l'étape 6. Si le site ne répond pas, connectez-vous en SSH et lisez `sudo cat /var/log/cloud-init-output.log`.

## 4. Installer Docker sur l'instance (méthode manuelle)

```bash
chmod 400 ma-cle.pem
ssh -i ma-cle.pem ec2-user@<IP_PUBLIQUE>

sudo dnf update -y
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
exit            # se reconnecter pour que le groupe docker soit pris en compte
ssh -i ma-cle.pem ec2-user@<IP_PUBLIQUE>
docker version
```

## 5. Déployer avec `docker pull` uniquement

Aucun `docker build` sur le serveur : on récupère l'image publiée.

```bash
docker pull <username>/ivoiremarket:v1
docker run -d \
  --name ivoiremarket \
  --restart unless-stopped \
  -p 80:3000 \
  <username>/ivoiremarket:v1
docker ps                       # attendre le statut "(healthy)"
curl -I http://localhost        # HTTP/1.1 200 OK
```

## 6. Vérifier depuis l'extérieur

Depuis votre ordinateur ou votre téléphone (en 4G, pour être vraiment hors du réseau), ouvrez :

```
http://<IP_PUBLIQUE>
```

Puis rejouez les tests de bout en bout contre le serveur :

```bash
BASE_URL=http://<IP_PUBLIQUE> npx playwright test
```

Le déploiement n'est terminé que lorsque cette page s'affiche depuis l'extérieur et que les tests passent.

## Mettre à jour (version v2)

```bash
# Sur votre poste
docker buildx build --platform linux/amd64 -t <username>/ivoiremarket:v2 --push .
# Sur l'instance
docker pull <username>/ivoiremarket:v2
docker rm -f ivoiremarket
docker run -d --name ivoiremarket --restart unless-stopped -p 80:3000 <username>/ivoiremarket:v2
```

## Dépannage

| Symptôme | Cause probable |
| --- | --- |
| Le navigateur ne répond pas | Port 80 absent du groupe de sécurité, ou vous utilisez `https://` au lieu de `http://` |
| `exec format error` dans `docker logs ivoiremarket` | Image construite pour ARM : reconstruire avec `--platform linux/amd64` |
| `permission denied ... docker.sock` | Reconnectez-vous en SSH après `usermod -aG docker ec2-user` |
| `pull access denied` | Dépôt Docker Hub privé ou nom d'image mal orthographié |
| Le site s'arrête après un redémarrage | Option `--restart unless-stopped` oubliée |

Pensez à **arrêter ou résilier l'instance** après la soutenance pour éviter des frais.
