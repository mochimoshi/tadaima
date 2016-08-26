var flickrKey = "ff97f4120c66e9295f2c4189b783e5ab";
var format = "json";
var rootURL = "https://api.flickr.com/services/rest/?";

$(document).ready(function() {
  chrome.storage.sync.get("flickrUserNSID", function(data) {
    if (data["flickrUserNSID"] != null) {
      updateBackgroundPhoto(data["flickrUserNSID"]);
    } else {
      getIDForUsername("thepianistalex");
    }
  })

  $("#settings-nav").click(function() {
    $(".settings-body").css("display", "block");
    chrome.storage.sync.get("flickrUsername", function(data) {
      $("#flickr-username-input").val(data["flickrUsername"]);
    });
  });

  $("#save-settings").click(function(e) {
    e.preventDefault;
    getIDForUsername($("#flickr-username-input").val());
    $(".settings-body").css("display", "none");
  });

  setInterval(updateClock, 1000);
});

function getIDForUsername(username) {
  var usernameKey = "username~" + username
  
  chrome.storage.local.get(usernameKey, function(data) {
    if (data[usernameKey] != null) {
      updateBackgroundPhoto(data[usernameKey]);
    } else {
      var method = "flickr.people.findByUsername";
      var url = getURLForAPI(method);
      url += "&username=" + username;
      
      $.getJSON(url).done(function(data) {
        var userNSID = data["user"]["nsid"];
        var localUsernameStoredObject = {};
        localUsernameStoredObject[usernameKey] = userNSID;

        chrome.storage.local.set(localUsernameStoredObject)
        chrome.storage.sync.set({
          "flickrUsername": username,
          "flickrUserNSID": userNSID
        }, function() {
          updateBackgroundPhoto(userNSID);
        });
      });
    }
  });
}

function updateBackgroundPhoto(nsid) {
  var photosKey = "photos~" + nsid;

  chrome.storage.local.get(photosKey, function(data) {
    if (data[photosKey] != null) {
      var photoArray = data[photosKey];
      var arrayIndex = Math.floor(Math.random() * photoArray.length);
      var photo = photoArray[arrayIndex];
      fadeInBackground(photo["url_h"]);
      updateAttribution(photo);
    } else {
      var method = "flickr.people.getPublicPhotos";
      var url = getURLForAPI(method);

      url += "&user_id=" + nsid;
      url += "&per_page=64&extras=url_h,geo,owner_name";

      $.getJSON(url).done(function(data) {
        var photoArray = data["photos"]["photo"];
        var arrayIndex = Math.floor(Math.random() * photoArray.length);
        var photo = photoArray[arrayIndex];
        fadeInBackground(photo["url_h"]);
        updateAttribution(photo);

        var localPhotosStoredObject = {};
        localPhotosStoredObject[photosKey] = photoArray;

        chrome.storage.local.set(localPhotosStoredObject);
      });
    }
  });
}

function fadeInBackground(photoURL) {
  $("#background-image").fadeOut(1000, function() {
    $("#background-image").remove();

    var img = new Image();
    img.style.display = "none";
    img.onload = function() {
      $(this).fadeIn(1000);
    };
    img.setAttribute("id", "background-image");
    $(".fade-in-image").append(img);
    img.src = photoURL
  });
  
}

function updateAttribution(photo) {
  var title = photo["title"]
  var owner = photo["ownername"];
  var ownerID = photo["owner"];
  var placeID = photo["place_id"];

  if (placeID == null) {
    $(".attribution").html("<p><a href='https://www.flickr.com/photos/" + ownerID + "/" + photo["id"] + "'>" + title + "</a> taken by <a href='https://www.flickr.com/" + ownerID + "'>" + owner + "</a></p>");
    return;
  }

  var placeIDKey = "placeID~" + placeID;
  chrome.storage.local.get(placeIDKey, function(data) {
    if (data[placeIDKey] != null) {
      var place = data[placeIDKey];
      $(".attribution").html("<p><a href='https://www.flickr.com/photos/" + ownerID + "/" + photo["id"] + "'>" + title + "</a> taken by <a href='https://www.flickr.com/" + ownerID + "'>" + owner + "</a></p><p><em>" + place + "</em></p>");
    } else {
      var method = "flickr.places.getInfo";
      var url = getURLForAPI(method);
      url += "&place_id=" + placeID;

      $.getJSON(url).done(function(data) {
        var place = data["place"].name;
        
        var localPlaceStoredObject = {};
        localPlaceStoredObject[placeIDKey] = place;

        chrome.storage.local.set(localPlaceStoredObject);

        $(".attribution").html("<p><a href='https://www.flickr.com/photos/" + ownerID + "/" + photo["id"] + "'>" + title + "</a> taken by <a href='https://www.flickr.com/" + ownerID + "'>" + owner + "</a></p><p><em>" + place + "</em></p>");
      });
    }
  })
}

function getURLForAPI(method) {
  var params = ["format=" + format, "api_key=" + flickrKey, "method=" + method, "nojsoncallback=1"];
  return rootURL + params.join("&");
}

function updateClock() {
  var currentTime = new Date();
  var currentHours = currentTime.getHours();
  var currentMinutes = currentTime.getMinutes();
  var currentSeconds = currentTime.getSeconds();

  // Pad the minutes and seconds with leading zeros, if required
  currentMinutes = (currentMinutes < 10 ? "0" : "") + currentMinutes;
  currentSeconds = (currentSeconds < 10 ? "0" : "") + currentSeconds;

  // Compose the string for display
  var currentTimeString = currentHours + ":" + currentMinutes + ":" + currentSeconds;
  
  $("#clock").html(currentTimeString);
 }
