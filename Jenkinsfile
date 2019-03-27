pipeline {
  agent {
    node {
      label 'kzy2'
    }

  }
  stages {
    stage('stash file') {
      steps {
        stash 'file'
      }
    }
  }
}