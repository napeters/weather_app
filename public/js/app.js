'use strict';
angular.module('WeatherApp', [])
  .controller('WeatherController', WeatherController);

WeatherController.$inject = ['$http'];

function WeatherController($http){
  let self = this;

  self.newUser = {},
  self.loggingInUser = {},
  self.currentUser = {},
  self.login = false,
  self.loginText = 'Log in',
  self.loginAction = function() {
    self.haveWeather = false;
    self.error = false;
    self.signup = false;
    self.login = true;
  },
  self.loginUser = function() {
    $http
      .post('http://localhost:5000/user/login', self.loggingInUser)
      .then(function(response){
        self.currentUser = response.data.currentUser;
        self.loggingInUser = {};
        self.login = false;
        self.haveWeather = true;
      });
  },
  self.signup = false,
  self.signupText = 'Create an account',
  self.signupAction = function() {
    self.haveWeather = false;
    self.error = false;
    self.login = false;
    self.signup = true;
  },
  self.signupUser = function() {
    $http
      .post('http://localhost:5000/user/signup', self.newUser)
      .then(function(response){
        self.currentUser = response.data.currentUser;
        self.newUser = {};
        self.signup = false;
        self.haveWeather = true;
      });
  },
  self.currentLatitude = null,
  self.currentLongitude = null,
  self.currentCity = '',
  self.inputCity = '',
  self.waiting = true,
  self.error = null,
  self.haveWeather = false,
  self.feelsLikeTemp = null,
  self.highTemp = null,
  self.lowTemp = null,
  self.descriptionTemp = '',
  self.getLocation = function() {
    let success = function(pos) {
      self.currentLatitude = pos.coords.latitude;
      self.currentLongitude = pos.coords.longitude;
      self.getCity();
    }
    navigator.geolocation.getCurrentPosition(success);
  },
  self.getCity = function() {
    let geocoder = new google.maps.Geocoder;
    geocoder.geocode({'location': {lat: self.currentLatitude, lng: self.currentLongitude}}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          for (var ac = 0; ac < results[0].address_components.length; ac++) {
            let component = results[0].address_components[ac];

            switch(component.types[0]) {
              case 'locality':
                self.currentCity = component.long_name;
                break;
              case 'administrative_area_level_1':
                self.currentCity += ', ' + component.short_name;
                break;
            }
          };
          self.currentCity = self.currentCity.toUpperCase();
          self.getWeather();
        } else {
          self.error = 'No results found';
        }
      } else {
        self.error = 'Geocoder failed due to: ' + status;
      }
    });
  },
  self.addLocation = function() {
    self.login = false;
    self.signup = false;
    self.haveWeather = false;
    self.waiting = true;
    $http
      .get('https://api.aerisapi.com/forecasts/closest?p=' +
            self.inputCity + '&from=today&to=today&client_id=RJtYUCLVJre7MGQmDzVth&client_secret=ll2C8gxAYx51cPoUTqBy3OfaXtDgsf1bJmefjNjt')
      .then(function(response){
        if (response.data.error) {
          self.waiting = false;
          self.inputCity = '';
          self.error = response.data.error.description;
        } else {
          self.waiting = false;
          self.error = null;
          self.haveWeather = true;
          self.currentCity = self.inputCity.toUpperCase();
          self.inputCity = '';
          self.feelsLikeTemp = response.data.response[0].periods[0].feelslikeF;
          self.highTemp = response.data.response[0].periods[0].maxTempF;
          self.lowTemp = response.data.response[0].periods[0].minTempF;
        }
      });
  },
  self.getWeather = function() {
    $http
      .get('https://api.aerisapi.com/forecasts/closest?p=' +
            self.currentLatitude + ',' + self.currentLongitude + '&from=today&to=today&client_id=RJtYUCLVJre7MGQmDzVth&client_secret=ll2C8gxAYx51cPoUTqBy3OfaXtDgsf1bJmefjNjt')
      .then(function(response){
        self.waiting = false;
        self.error = null;
        self.haveWeather = true;
        self.feelsLikeTemp = response.data.response[0].periods[0].feelslikeF;
        self.highTemp = response.data.response[0].periods[0].maxTempF;
        self.lowTemp = response.data.response[0].periods[0].minTempF;
        self.descriptionTemp = response.data.response[0].periods[0].weather;
        self.currentLatitude = response.data.response[0].loc.lat;
        self.currentLongitude = response.data.response[0].loc.long;
        // console.log(response);
        // console.log(response.data.response[0].interval);
        // console.log(response.data.response[0].periods[0].icon);
        // console.log(response.data.response[0].periods[0].pop);
        // console.log(response.data.response[0].periods[0].precipIN);
        // console.log(response.data.response[0].periods[0].windSpeedMaxMPH);
      });
  }
}



// https://api.aerisapi.com/forecasts/closest?p=43.567,-100.895?from=today&to=today&client_id=RJtYUCLVJre7MGQmDzVth&client_secret=ll2C8gxAYx51cPoUTqBy3OfaXtDgsf1bJmefjNjt


// http://api.openweathermap.org/data/2.5/forecast/city?id=524901&APPID=2c526c5d69538028e04f60577d6c8014

// 'http://api.openweathermap.org/data/2.5/forecast/weather?lat=' +
//    self.currentLatitude + '&lon=' + self.currentLongitude + '&APPID=2c526c5d69538028e04f60577d6c8014'
