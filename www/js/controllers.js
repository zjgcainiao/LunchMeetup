angular.module('starter.controllers', [])


// HOME PAGE CONTROLLER
.controller('DashCtrl', function($scope, Rooms, Chats, IonicLogin) {

  console.log("Rooms Controller initialized");
  $scope.rooms = Rooms.all();

  $scope.openChatRoom = function (roomId) {
      $state.go('tab.chats', {
          roomId: roomId
      });
  }
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

// LOGIN PAGE CONTROLLER - Login and Sign Up Functions
.controller('IonicLogin', function($scope, $state, $timeout, $firebaseAuth, $rootScope, $ionicLoading, $cordovaOauth) {
  console.log('Login Controller Initialized');

  // // REMOVE THE USER LOGIN INFORMATION WHEN RETURNING TO LOGIN SCREEN
  // $scope.$on('$ionicView.enter', function(e) {
  //     $scope.data = {} ;
  // });
  //
  // // LOGOUT FUNCTION
  // $scope.logout = function(){
  //      IonicLogin.logout();
  // }
  $scope.authObj = $firebaseAuth();
  var firebaseUser = $scope.authObj.$getAuth();
  var datbaseRef = firebase.database();
  $scope.createUser = function (user) {
      console.log("Create User Function called");
      if (user && user.email && user.password && user.displayname) {
          $ionicLoading.show({
              template: 'Signing Up...'
          });

          $scope.authObj.$createUserWithEmailAndPassword(
            user.email,
            user.password
          ).then(function (firebaseUser) {
              alert("User "+ firebaseUser.uid + " created successfully!");

              firebase.database().ref("users").child(firebaseUser.uid).set({
                  email: user.email,
                  displayName: user.displayname
              });
              $timeout(function() { $state.go('tab.dash');});
              $ionicLoading.hide();
              // $scope.modal.hide();

              // $state.transitionTo('tab.dash');

          }).catch(function (error) {
              alert("Error: " + error);
              $ionicLoading.hide();
          });
      } else
          alert("Please fill all details");
  }

  $scope.signIn = function (user) {

      if (user && user.email && user.pwdForLogin) {
          $ionicLoading.show({
              template: 'Signing In...'
          });
          firebase.auth().signInWithEmailAndPassword(
              user.email,
              user.pwdForLogin
          ).then(function (authData) {
              console.log("Logged in as:" + authData.uid);
              firebase.database().ref("users").child(authData.uid).once('value', function (snapshot) {
                  var val = snapshot.val();
                  // To Update AngularJS $scope either use $apply or $timeout
                  $scope.$apply(function () {
                      $rootScope.displayName = val;
                  });
              });
              $ionicLoading.hide();
              $state.go('tab.dash');
          }).catch(function (error) {
              alert("Authentication failed:" + error.message);
              $ionicLoading.hide();
          });
      } else
          alert("Please enter email and password both");
  }
  // // LOGIN FUNCTION
  // $scope.login = function(){
  //      IonicLogin.login($scope.data.email, $scope.data.password);
  // }
  //
  //  // SIGNUP FUNCTION
  //  $scope.signUp = function(){
  //     IonicLogin.signUp($scope.data.email, $scope.data.password);
  // }

  // FACEBOOK LOGIN
  var fbProvider = new firebase.auth.FacebookAuthProvider();
  fbProvider.addScope('user_birthday');
  fbProvider.addScope('email');
  fbProvider.addScope('public_profile');
  fbProvider.setCustomParameters({
      'display': 'popup'
  });
  $scope.facebookLogin = function() {
      firebase.auth().signInWithPopup(fbProvider).then(function(result) {
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
          alert ("Facebook Login successfully.");
          $ionicLoading.hide();
          var token = result.credential.accessToken;
          // The signed-in user info.
          var user = result.user;
          firebase.database().ref("users/"+ result.public_profile.id).set({
              email: user.email,
              displayName: result.public_profile.name,
              ageRange: result.public_profile.age_range
          });
          // ...
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log ("Facebook Login failed." + errorCode);
        alert("Facebook Login Failed. " + errorMessage);
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        $ionicLoading.hide();
        // ...
      });
  }
  // $scope.facebookLogin = function() {
  //
  //      var appID = "1628077107489568"; // PUT YOUR FACEBOOK APP ID HERE
  //      var redirectURL = "http://login-oauth-146316.appspot.com/callback" ; // PUT YOUR APP CALLBACK URL HERE
  //
  //      $cordovaOauth.facebook(appID, ["email"], {redirect_uri: redirectURL})
  //           .then(function(result){
  //               var access_token = result.access_token;
  //
  //              $http.get("https://graph.facebook.com/v2.8/me",
  //                   { params: {access_token: access_token, fields: "name, email", format: "json" }})
  //                       .then(function(user) {
  //                       //     alert(JSON.stringify(user));
  //                            IonicLogin.socialLogin( user.data.email, user.data.id); // USING ID TO GENERATE A HASH PASSWORD
  //                   })
  //       },
  //         function(error){
  //               console.log("Facebook Login Error: " + error);
  //       });
  //   }

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
.controller('ChatsCtrl', function($scope, Chats,$state, $stateParams, IonicLogin) {

  $scope.IM = {
      textMessage: ""
  };

  Chats.selectRoom($state.params.roomId);

  var roomName = Chats.getSelectedRoomName();

  // Fetching Chat Records only if a Room is Selected
  if (roomName) {
      $scope.roomName = " - " + roomName;
      $scope.chats = Chats.all();
  }

  $scope.sendMessage = function (msg) {
      console.log(msg);
      Chats.send($scope.displayName, msg);
      $scope.IM.textMessage = "";
  }

  $scope.remove = function (chat) {
      Chats.remove(chat);
  }
})

// ACCOUNT SETTINGS CONTROLLER
.controller('AccountCtrl', function($scope) {

})

// MAP CONTROLLER
.controller('MapCtrl', function($scope, $ionicLoading, $compile, $cordovaGeolocation) {
    function initialize() {
      var myLatlng = new google.maps.LatLng(34.0953,-118.1270); //location of Alhambra
      var mapOptions = {
        center: myLatlng,
        zoom: 13,
        disableDefaultUI: true,// DISABLE MAP TYPE
        scrollwheel: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      var map = new google.maps.Map(document.getElementById('map'), mapOptions);

      var input = /** @type {HTMLInputElement} */ (
      document.getElementById('pac-input'));

    //Create the search box and link it to the UI element
    var searchBox = new google.maps.places.SearchBox(input);
    // Create the autocomplete helper, and associate it with
    // an HTML text input box.
      // var autocomplete = new google.maps.places.Autocomplete(input);
      // autocomplete.bindTo('bounds', map);
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
      var infowindow = new google.maps.InfoWindow();
      var marker = new google.maps.Marker({
        position: myLatlng,
        map: map
      });
      google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map, marker);
      });
      //Bias the SearchBox result towards current map's viewport
      map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
      });

      var markers = [];
      // Listen for the event fired when the user selects a prediction and retrieve
      // more details for that place.
      searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
          return;
        }

        // Clear out the old markers.
        markers.forEach(function(marker) {
          marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
          if (!place.geometry) {
            console.log("Returned place contains no geometry");
            return;
          }
          var icon = {
            url: place.icon,
            size: new google.maps.Size(20, 20),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25)
          };

          // Create a marker for each place.
          markers.push(new google.maps.Marker({
            map: map,
            icon: icon,
            title: place.name,
            position: place.geometry.location
          }));

          if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });
        map.fitBounds(bounds);
      });


      $scope.map = map;
      // Get the full place details when the user selects a place from the
      // list of suggestions.

      // google.maps.event.addListener(autocomplete, 'place_changed', function() {
      //   infowindow.close();
      //   var place = autocomplete.getPlace();
      //   if (!place.geometry) {
      //   return;
      //   }
      //   if (place.geometry.viewport) {
      //   map.fitBounds(place.geometry.viewport);
      //   } else {
      //   map.setCenter(place.geometry.location);
      //   map.setZoom(17);
      //   }
      //   // Set the position of the marker using the place ID and location.
      //   marker.setPlace( /** @type {!google.maps.Place} */ ({
      //   placeId: place.place_id,
      //   location: place.geometry.location
      //   }));
      //   marker.setVisible(true);
      //   infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
      //   'Place ID: ' + place.place_id + '<br>' +
      //   place.formatted_address + '</div>');
      //   infowindow.open(map, marker);
      // });


    }
  // Run the initialize function when the window has finished loading.
  //maps.html is part of the view. we have to wait until the page is fully loaded.
  //jquery is thus added to ensure we could async load the map
    $(window).ready(initialize);
    $(window).on('page:load',initialize);
    // google.maps.event.addDomListener(window, 'load', initialize);

  $scope.centerOnMe = function() {
    if(!$scope.map) {
      return;
    }

    $scope.loading = $ionicLoading.show({
      content: 'Getting current location...',
      showBackdrop: false
    });

    navigator.geolocation.getCurrentPosition(function(pos) {
      $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
      $scope.loading.hide();
    }, function(error) {
      alert('Unable to get location: ' + error.message);
    });
  };

  $scope.clickTest = function() {
    alert('Example of infowindow with ng-click')
  };
});
