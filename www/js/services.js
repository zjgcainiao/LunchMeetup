angular.module('starter.services', ['firebase'])
// .factory("Auth", ["$firebaseAuth", "$rootScope",
// function ($firebaseAuth, $rootScope) {
//         var ref = new Firebase(firebaseUrl);
//         return $firebaseAuth(ref);
//         $rootScope.auth = firebase.auth();
// }])

.factory('Chats', function ($firebase, Rooms) {

var selectedRoomId;

var ref = firebase.database.ref();
var chats;

return {
    all: function () {
        return chats;
    },
    remove: function (chat) {
        chats.$remove(chat).then(function (ref) {
            ref.key() === chat.$id; // true item has been removed
        });
    },
    get: function (chatId) {
        for (var i = 0; i < chats.length; i++) {
            if (chats[i].id === parseInt(chatId)) {
                return chats[i];
            }
        }
        return null;
    },
    getSelectedRoomName: function () {
        var selectedRoom;
        if (selectedRoomId && selectedRoomId != null) {
            selectedRoom = Rooms.get(selectedRoomId);
            if (selectedRoom)
                return selectedRoom.name;
            else
                return null;
        } else
            return null;
    },
    selectRoom: function (roomId) {
        console.log("selecting the room with id: " + roomId);
        selectedRoomId = roomId;
        if (!isNaN(roomId)) {
            chats = $firebase(ref.child('rooms').child(selectedRoomId).child('chats')).$asArray();
        }
    },
    send: function (from, message) {
        console.log("sending message from :" + from.displayName + " & message is " + message);
        if (from && message) {
            var chatMessage = {
                from: from.displayName,
                message: message,
                createdAt: Firebase.ServerValue.TIMESTAMP
            };
            chats.$add(chatMessage).then(function (data) {
                console.log("message added");
            });
        }
    }
}
})

/**
* Simple Service which returns Rooms collection as Array from Salesforce & binds to the Scope in Controller
*/
.factory('Rooms', function ($firebase) {
// Might use a resource here that returns a JSON array
var ref = new Firebase(firebaseUrl);
var rooms = $firebase(ref.child('rooms')).$asArray();

return {
    all: function () {
        return rooms;
    },
    get: function (roomId) {
        // Simple index lookup
        return rooms.$getRecord(roomId);
    }
}
})

.factory('IonicLogin', function( $http, $state, $ionicPopup, $ionicLoading) {

  function login(email, password){

      $ionicLoading.show({
              template: 'Logging into Account...'
          });

      $http.post("http://login-oauth-146316.appspot.com/login",
             { params: {
                         "email": email,
                         "password": password}
                        })
               .success(function(response) {

                    $ionicLoading.hide();

              if ( response == "LOGIN_FAIL" ){
                    $ionicPopup.alert({
                     title: 'Login Failed',
                      template: 'Wrong email and/or password.'
                    });
              }
             else{ // SUCCESS

                  window.localStorage['session'] = JSON.stringify(response);
                  $state.transitionTo('tab.dash');
             }
            })
            .error(function(response) {

                   $ionicLoading.hide();

                   $ionicPopup.alert({
                       title: 'Login',
                       template: 'Service unavailable, make sure you are online.'
                   });
            });
  }


  function logout(email){

        $ionicLoading.show({
              template: 'Logging Out...'
          });

        $http.post("http://login-oauth-146316.appspot.com/logout",
             { params: { "email": email }})
               .success(function(response) {

                    $ionicLoading.hide();

              if ( response == "LOGIN_FAIL" ){
                    $ionicPopup.alert({
                     title: 'Logout Failed',
                      template: 'Oops something went wrong.'
                    });
              }
             else{ // SUCCESS

                  window.localStorage['session'] = "";
                  $state.transitionTo('login');
             }
            })
            .error(function(response) { // IF THERE IS AN ERROR LOGOUT ANYWAY

                   $ionicLoading.hide();

                  window.localStorage['session'] = "";
                  $state.transitionTo('login');
            });
  }


  function signUp(email, password){

       $ionicLoading.show({
              template: 'Creating Account...'
          });

            $http.post("http://login-oauth-146316.appspot.com/signUp",
               { params: {
                           "email": email,
                           "password": password }
                           })
                 .success(function(response) {

                      $ionicLoading.hide();

                if ( response == "USER_EXISTS" ){
                      $ionicPopup.alert({
                       title: 'Username Taken',
                        template: 'Username taken, try another one.'
                      });
                }
               else{ // SUCCESS

                    window.localStorage['session'] = JSON.stringify(response);
                    $state.transitionTo('tab.dash');
               }
              })
              .error(function(response) {
                     $ionicLoading.hide();

                     $ionicPopup.alert({
                         title: 'Account',
                         template: 'Service unavailable, make sure you are online.'
                     });
              });
  }


 function socialLogin(email, password){

       $ionicLoading.show({
              template: 'Loggin In...'
          });

            $http.post("http://login-oauth-146316.appspot.com/socialLogin",
               { params: {
                           "email": email,
                           "password": password }
                           })
                 .success(function(response) {

                    $ionicLoading.hide();

                    window.localStorage['session'] = JSON.stringify(response);
                    $state.transitionTo('tab.dash');

              })
              .error(function(response) {
                     $ionicLoading.hide();

                     $ionicPopup.alert({
                         title: 'Account',
                         template: 'Service unavailable, make sure you are online.'
                     });
              });
  }

  return {

    login: login,
    signUp: signUp,
    logout: logout,
    socialLogin: socialLogin

  };
});
