angular.module('starter.services', ['firebase'])
.factory("Auth", ["$firebaseAuth", "$rootScope",
function ($firebaseAuth, $rootScope) {
        var ref = new Firebase(firebaseDatabseUrl);
        return $firebaseAuth(ref);
}])

.factory('Chats', function ($firebase, Friends) {

var selectedFriendId;

var ref = new Firebase(firebaseDatabseUrl);
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
    get: function (friendId) {
        for (var i = 0; i < chats.length; i++) {
            if (chats[i].id === parseInt(chatId)) {
                return chats[i];
            }
        }
        return null;
    },
    getSelectedFriendName: function () {
        var selectedFriend;
        if (selectedFriendId && selectedFriendId != null) {
            selectedFriend = Friends.get(selectedFriendId);
            if (selectedFriend)
                return selectedFriend.name;
            else
                return null;
        } else
            return null;
    },
    selectFriend: function (roomId) {
        console.log("selecting the friend with id: " + friendId);
        selectedFriendId = friendId;
        if (!isNaN(friendId)) {
            chats = $firebase(ref.child('friends').child(selectedFriendsId).child('chats')).$asArray();
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
.factory('Friends', function ($firebase) {
// Might use a resource here that returns a JSON array
var ref = new Firebase(firebaseDatabseUrl);
var friends= $firebase(ref.child('friends')).$asArray();

return {
    all: function () {
        return friends;
    },
    get: function (friendId) {
        // Simple index lookup
        return rooms.$getRecord(friendId);
    }
}
});

//OLD----using Server Side NodeJs to login and logout users
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
