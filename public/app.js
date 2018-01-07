const icvApp = angular.module('icvApp', ['ngMaterial', 'ui.router']);

////===================== ui-routing ===========================

icvApp.config(function ($stateProvider, $urlRouterProvider) {
  
    const mainState = {
      name: 'main',
      url: '/main',
      templateUrl: './templates/main.html'
    }
  
    const resultState = {
      name: 'result',
      url: '/result',
      templateUrl: './templates/result.html'
    }
  
    $stateProvider
      .state(mainState)
      .state(resultState);
      
    $urlRouterProvider.otherwise("/main");
  });


