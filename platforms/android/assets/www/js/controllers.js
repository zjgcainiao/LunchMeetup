angular.module('starter.controllers', [])


// HOME PAGE CONTROLLER
.controller('DashCtrl', function($scope, IonicLogin) {

  $scope.$on('$ionicView.enter', function(e) {
      $scope.session = JSON.parse( window.localStorage['session']) ; // read the session information
  });

   $scope.logout = function(){
       IonicLogin.logout($scope.session.email);
  }
})

.controller('SplashController', function ($scope, $state, $window, $http){

    $scope.$on("$ionicView.enter", function(event) {
          $scope.checkSession();
    });

  $scope.checkSession = function () {

        if ( window.localStorage['session'] != null &&  window.localStorage['session'] != undefined )
        {
            var sesh = JSON.parse(window.localStorage['session']) ;

              $http.post("http://login-oauth-146316.appspot.com/checkSession",
                { params: { "session": JSON.stringify(sesh)}})
                  .success(function(response) {
                   if ( response == "error" || response == "LOGIN_FAIL" ){
                        $state.go('home');
                   }
                   else{
                       $state.go('tab.dash');
                  }
                })
                .error(function(response) {
                  $state.go('home');
            });
        }
        else{
           $state.go('home');
        }
     }
})

// LOGIN PAGE CONTROLLER
.controller('IonicLogin', function($scope, IonicLogin, $ionicLoading, $cordovaOauth, $http) {

  // REMOVE THE USER LOGIN INFORMATION WHEN RETURNING TO LOGIN SCREEN
  $scope.$on('$ionicView.enter', function(e) {
      $scope.data = {} ;
  });

  // LOGOUT FUNCTION
  $scope.logout = function(){
       IonicLogin.logout();
  }

  // LOGIN FUNCTION
  $scope.login = function(){
       IonicLogin.login($scope.data.email, $scope.data.password);
  }

   // SIGNUP FUNCTION
   $scope.signUp = function(){
      IonicLogin.signUp($scope.data.email, $scope.data.password);
  }

  // FACEBOOK LOGIN
  $scope.facebookLogin = function() {

       var appID = "1628077107489568"; // PUT YOUR FACEBOOK APP ID HERE
       var redirectURL = "http://login-oauth-146316.appspot.com/callback" ; // PUT YOUR APP CALLBACK URL HERE

       $cordovaOauth.facebook(appID, ["email"], {redirect_uri: redirectURL})
            .then(function(result){
                var access_token = result.access_token;

               $http.get("https://graph.facebook.com/v2.8/me",
                    { params: {access_token: access_token, fields: "name, email", format: "json" }})
                        .then(function(user) {
                        //     alert(JSON.stringify(user));
                             IonicLogin.socialLogin( user.data.email, user.data.id); // USING ID TO GENERATE A HASH PASSWORD
                    })
        },
          function(error){
                console.log("Facebook Login Error: " + error);
        });
    }

    // TWITTER LOGIN
    $scope.twitterLogin = function(){

          // YOUR TWITTER CALLBACK WILL HAVE TO BE HTTP://login-oauth-146316.appspot.com/CALLBACK FOR TESTING BUT
          // IT NEEDS TO BE SET VIA TINYURL.COM
           var consumerKey = "fMNg8ecQmeOTHNFGgJKsGwYbw"; // PUT YOUR CONSUMER KEY HERE
           var consumerSecretKey = "cPOHMNSrDXLb1dXrVQP0e3CaeSlVGONzYgGq92gpPh38q9g51Q"; // PUT YOUR SECRET KEY HERE
           var oathToken = ""
           var oathSecret = "" ;

          $cordovaOauth.twitter( consumerKey,  consumerSecretKey)
              .then(function(result){
               // alert(JSON.stringify(user));
                oathToken = result.oauth_token ;
                oathSecret = result.oauth_token_secret ;

                // IF YOU WANT TO GET TWITTER USERS EMAIL ADDRESS YOU WILL HAVE TO WHITELIST YOUR APP WITH TWITTER
                // THEY DO NOT ALLOW IT BY DEFAULT
                // https://dev.twitter.com/rest/reference/get/account/verify_credentials
              IonicLogin.socialLogin( result.screen_name, result.user_id ); // USING ID TO GENERATE A HASH PASSWORD
        });
    }

    // GOOGLE PLUS LOGIN
    $scope.googleLogin = function(){

          // CREATE A PROJECT ON GOOGLE DEVELOPER CONSOLE AND PUT YOUR CLIENT ID HERE
          // GOOGLE OAUTH DOES NOT GIVE US EMAIL RIGHT AWAY SO WE HAVE TO MAKE 2 API CALLS
          $cordovaOauth.google("584540832467-tv8i4a8utt7tk5aih3ej8a6gc65sjk87.apps.googleusercontent.com", ["email"], {redirect_uri: "http://login-oauth-146316.appspot.com/callback"}).then(function(result) {
                  //   alert("Response Object -> " + JSON.stringify(result));

                  $http.get("https://www.googleapis.com/plus/v1/people/me", // TO GET THE USER'S EMAIL
                     { params: {access_token: result.access_token,
                              key: "584540832467-tv8i4a8utt7tk5aih3ej8a6gc65sjk87.apps.googleusercontent.com"}})
                        .then(function(user) {
                     //      alert(JSON.stringify(user));
                             IonicLogin.socialLogin( user.data.emails[0].value, result.access_token); // USING ID TO GENERATE A HASH PASSWORD
                        });
            });
     }

    // INSTAGRAM LOGIN
    $scope.instagramLogin = function(){

        var clientID = "a0c936f91d4d4219b3230fb96650216d" ; // PUT YOUR CLIENT ID HERE
        var redirectURL = "http://tinyurl.com/krmpchb" // PUT YOUR REDIRECT URL HERE

        $cordovaOauth.instagram(clientID, ["basic"], {redirect_uri: redirectURL})
          .then(function(result){
                  // INSTAGRAM OAUTH DOES NOT GIVE US USERNAME SO WE HAVE TO MAKE 2 API CALLS
                  $http.get("https://api.instagram.com/v1/users/self/", // TO GET THE USERSNAME
                     { params: {access_token: result.access_token }})
                        .then(function(user) {
                     //     alert(JSON.stringify(user));
                            IonicLogin.socialLogin( user.data.data.username, result.access_token); // USING ID TO GENERATE A HASH PASSWORD
                        });
          });
    }
})

// CHAT CONTROLLER
.controller('ChatsCtrl', function($scope, $stateParams, IonicLogin) {

})

// ACCOUNT SETTINGS CONTROLLER
.controller('AccountCtrl', function($scope) {

});

// //MAP CONTROLLER
// .controller('MapCtrl', function($scope, $cordovaGeolocation) {
  //----Google Map Section---//
  // Getting the map selector in DOM
  // var div = document.getElementById("map_canvas");
  //
  // // Invoking Map using Google Map SDK v2 by dubcanada
  // var map = google.maps.Map.getMap(div,{
  //     'camera': {
  //         'latLng': setPosition(-19.9178713, -43.9603117),
  //         'zoom': 10
  //     }
  // });
  //
  // // Capturing event when Map load are ready.
  // map.addEventListener(google.maps.event.MAP_READY, function(){
  //
  //     // Defining markers for demo
  //     var markers = [{
  //         position: setPosition(-19.9178713, -43.9603117),
  //         title: "Marker 1"
  //     }, {
  //         position: setPosition(-19.8363826, -43.9787167),
  //         title: "Marker 2"
  //     }];
  //
  //     // Bind markers
  //     for (var i = 0; i < markers.length; i++) {
  //         map.addMarker({
  //             'marker': markers[i],
  //             'position': markers[i].position
  //         }, function(marker) {
  //
  //             // Defining event for each marker
  //             marker.on("click", function() {
  //                 alert(marker.get('marker').title);
  //             });
  //
  //         });
  //     }
  // });
  //
  // // Function that return a LatLng Object to Map
  // function setPosition(lat, lng) {
  //     return new plugin.google.maps.LatLng(lat, lng);
  // }
//----

  // var options = {timeout: 10000, enableHighAccuracy: true};
  //
  // $cordovaGeolocation.getCurrentPosition(options).then(function(position){
  //
  //   var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  //
  //   var mapOptions = {
  //     center: latLng,
  //     zoom: 15,
  //     mapTypeId: google.maps.MapTypeId.ROADMAP
  //   };
  //
  //   $scope.map_canvas = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
  //
  // }, function(error){
  //   console.log("Could not get location");
  // });

// };
