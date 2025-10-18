# Ejecutar shell

```sh
sudo docker exec -it mongo-labs mongosh
```


# Instalar mongo db database tools

```sh
echo "deb [signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
```

```sh
sudo apt update
```

```sh
sudo apt install mongodb-database-tools
```

