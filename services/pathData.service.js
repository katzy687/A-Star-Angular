icvApp.service('PathDataService', function () {

  let serviceData = {};

  this.save = (data) => {
    serviceData = data; 
    console.log(this.data); 
    console.log(serviceData);    
  };

  this.getData = () => {
    return serviceData;
  };

});