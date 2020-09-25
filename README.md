# FFA Website and HealthCoach Application 

### Installation 


git clone this repository
create an .env-file with the application specifics
docker network create   --driver=bridge   --subnet=172.20.0.0/16   --ip-range=172.20.0.0/24   --gateway=172.20.0.1   ffa-app-network
docker-compose up --build -d
http://{host_ip}:{defined_port_from_ENV_file}

### License 
GNU GPL

The GNU General Public License is a free, copyleft license for software and other kinds of works. Commercial usage of this software requires written approval. Please contact the repository owner for further information.