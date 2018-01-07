icvApp.controller('ResultCtrl',
['$scope',
  '$q',
  '$timeout',
  '$interval',
  '$mdDialog',
  '$state',
  'PathDataService',
  function ($scope, $q, $timeout, $interval, $mdDialog, $state, PathDataService) {

    ////===================== set initial tiles ===========================
    this.$onInit = () => {
      console.log('initialized resultController');
      this.stats = PathDataService.getData();
      console.log('this.resultStats', this.stats);

    }

    

  }]);
// end of controller 