pipeline {
    agent any

    triggers {
        pollSCM('H/30 * * * *')
    }

    stages {
        stage('Stop Old Containers') {
            steps {
                sh 'docker-compose down || true'
            }
        }

        stage('Build Containers') {
            steps {
                sh 'docker-compose up --build -d'
            }
        }

        stage('Verify') {
            steps {
                sh 'docker ps'
            }
        }
    }
}