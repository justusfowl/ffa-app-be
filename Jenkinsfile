pipeline {
    
    agent {
        dockerfile {
            args '-t ffa_web'
        }
    }
    stages {
        stage('Finish') {
            steps {
                echo "FFA complete"
            }
        }
    }
}