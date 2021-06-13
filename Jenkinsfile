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
    stage('Test Pipeline') {
      steps {
        echo 'Running a pipeline...'
        echo 'Hello World'
      }
    }
  }
}
