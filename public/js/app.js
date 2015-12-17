'use strict';
angular.module('WeatherApp', [])
  .controller('WeatherController', WeatherController);

WeatherController.$inject = ['$http'];

function WeatherController($http){
  let self = this;

  self.tilt = 0;
  self.landscape = null,
  self.portrait = true,
  self.newUser = {},
  self.loggingInUser = {},
  self.currentUser = null,
  self.currentUserLocations = [],
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
        self.loginText = 'Log out';
        self.signupText = self.currentUser.user_name;
        self.createLocation();
        self.getCurrentUserLocations();
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
  self.getOrientation = function() {
    let deviceOrientationHandler = function(tilt) {
      if (tilt > 80 && tilt < 100) {
        self.portrait = false;
        self.landscape = true;
        document.getElementsByClassName("portrait-container")[0].style.display = "none";
        document.getElementsByClassName("landscape-container")[0].style.display = "inline-block";
        document.getElementsByClassName("landscape-container")[0].style.webkitTransform = "rotate(-90deg)";
      } else if (tilt < -80 && tilt > -100) {
        self.portrait = false;
        self.landscape = true;
        document.getElementsByClassName("portrait-container")[0].style.display = "none";
        document.getElementsByClassName("landscape-container")[0].style.display = "inline-block";
        document.getElementsByClassName("landscape-container")[0].style.webkitTransform = "rotate(90deg)";
      } else {
        self.landscape = false;
        self.portrait = true;
        document.body.style.webkitTransform = "";
        document.getElementsByClassName("landscape-container")[0].style.display = "none";
        document.getElementsByClassName("portrait-container")[0].style.display = "inline-block";
      }
    };
    window.addEventListener('deviceorientation', function(eventData) {
      let tilt = eventData.gamma;
      self.tilt = tilt;
      deviceOrientationHandler(tilt);
    }, false);
  },
  self.listenToLocation = function() {
    let recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = function(event) {
      document.getElementById("listen").innerHTML = event.results[0][0].transcript;
      if (event.results[0].isFinal) {
        self.inputCity = event.results[0][0].transcript;
        self.addLocation();
      }
    }
    recognition.start();
  },
  self.getLocation = function() {
    let success = function(pos) {
      self.currentLatitude = pos.coords.latitude;
      self.currentLongitude = pos.coords.longitude;
      self.getCity();
      self.getOrientation();
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
  self.addLocation = function(location) {
    self.error = false;
    self.login = false;
    self.signup = false;
    self.haveWeather = false;
    self.waiting = true;
    if (self.inputCity == '') {self.inputCity = location};
    $http
      .get('https://api.aerisapi.com/forecasts/closest?p=' +
            self.inputCity + '&from=today&to=today&client_id=RJtYUCLVJre7MGQmDzVth&client_secret=gDvmiFtTVvrE3BDxA29ChcKMcpmn58AdgE6nYKGS')
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
          if (self.currentUser ) {self.createLocation()};
        }
      });
  },
  self.getWeather = function() {
    $http
      .get('https://api.aerisapi.com/forecasts/closest?p=' +
            self.currentLatitude + ',' + self.currentLongitude + '&from=today&to=today&client_id=RJtYUCLVJre7MGQmDzVth&client_secret=gDvmiFtTVvrE3BDxA29ChcKMcpmn58AdgE6nYKGS')
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
  },
  self.createLocation = function() {
    $http
      .post('http://localhost:5000/location', {
        _userId: self.currentUser._id,
        city_state: self.currentCity,
        lat: self.currentLatitude,
        lng: self.currentLongitude
      })
      .then(function(response) {
        self.currentUserLocations.push(response.data.city_state);
      });
  },
  self.deleteLocation = function(location) {
    let data = JSON.stringify({params: {here: location}});
    let data_parsed = JSON.parse(data);
    $http
      .delete('http://localhost:5000/location', data_parsed)
      .then(function(response) {
        let index = self.currentUserLocations.indexOf(location);
        self.currentUserLocations.splice(index, 1);
      });
  },
  self.getCurrentUserLocations = function() {
    $http
      .get('http://localhost:5000/location')
      .then(function(response) {
        let allLocations = response.data;
        allLocations.forEach(function(location) {
          if (self.currentUserLocations.indexOf(location.city_state) == -1) {
            self.currentUserLocations.push(location.city_state);
          }
        });
      });
  }
}



// https://api.aerisapi.com/forecasts/closest?p=43.567,-100.895?from=today&to=today&client_id=RJtYUCLVJre7MGQmDzVth&client_secret=ll2C8gxAYx51cPoUTqBy3OfaXtDgsf1bJmefjNjt


// http://api.openweathermap.org/data/2.5/forecast/city?id=524901&APPID=2c526c5d69538028e04f60577d6c8014

// 'http://api.openweathermap.org/data/2.5/forecast/weather?lat=' +
//    self.currentLatitude + '&lon=' + self.currentLongitude + '&APPID=2c526c5d69538028e04f60577d6c8014'
