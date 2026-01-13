pipeline {
    agent any

    stages {
        stage('Git checkout.') {
            steps {
                checkout scm
            }
        }

        stage('Build application') {
            steps {
                sh 'docker build . -t "prinshertog/discord-alfred-bot"'
            }
        }
        
        stage('Build full application and push to docker hub. (dev)') {
            when {
                branch 'dev'
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-prinshertog',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                      echo "$DOCKER_PASS" | docker login \
                        --username "$DOCKER_USER" \
                        --password-stdin
                    '''
                    sh 'docker build . -t "prinshertog/discord-alfred-bot:dev" && docker push prinshertog/discord-alfred-bot:dev'
                }
            }
        }

        stage('Build full application and push to docker hub. (main)') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-prinshertog',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                      echo "$DOCKER_PASS" | docker login \
                        --username "$DOCKER_USER" \
                        --password-stdin
                    '''
                    sh 'docker build . -t "prinshertog/discord-alfred-bot" && docker push prinshertog/discord-alfred-bot'
                }
            }
        }
    }
}
