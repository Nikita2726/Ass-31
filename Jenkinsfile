pipeline {
    agent any

    triggers {
        pollSCM('H/30 * * * *')
    }

    stages {
        stage('Stop Old Containers') {
            steps {
                bat 'docker-compose down'
            }
        }

        stage('Build Containers') {
            steps {
                bat 'docker-compose up --build -d'
            }
        }

        stage('Verify') {
            steps {
                bat 'docker ps'
            }
        }
    }
}