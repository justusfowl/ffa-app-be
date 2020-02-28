# FFA Website and HealthCoach Application 

### Installation 

git clone this repository
create an .env-file with the application specifics
docker-compose up --build -d
http://{host_ip}:{defined_port_from_ENV_file}

### ToDos: 
* Open bug fix when deploying the application through jenkins that runs within a docker container itself. Mounting the ./init/init_mongo.js is not working properly; this affects only the first setup and requires manually entering the container and executing the commands from the init_mongo.js file.