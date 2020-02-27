pipeline {
    
    agent none

    agent {
        dockerfile {
            args '-t ffa_web'
        }
    }
    
    stages {

        
        stage('docker-compose') {
            steps {
                sh "docker-compose build"
                sh "docker-compose up -d"
                ...
            }
        }

        stage('Finish') {
            steps {
                echo "FFA complete"
            }
        }
    }
}