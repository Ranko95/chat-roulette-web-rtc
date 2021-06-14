#!groovy
properties([disableConcurrentBuilds()])

pipeline {
  agent {
    label 'master'
  }
  triggers {
    githubPush()
  }
  options {
    buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '10'))
    timestamps()
  }
  stages {
    stage('Deploy') {
      steps {
        sh 'docker-compose build'
        sh 'docker-compose up -d'
      }
    }
  }
}
