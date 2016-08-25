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
});

function getIDForUsername(username) {
  var method = "flickr.people.findByUsername";
  var url = getURLForAPI(method);
  url += "&username=" + username;
  
  $.getJSON(url).done(function(data) {
    var userNSID = data["user"]["nsid"];
    chrome.storage.sync.set({
      "flickrUsername": username,
      "flickrUserNSID": userNSID
    }, function() {
      updateBackgroundPhoto(userNSID);
    });
  });
}

function updateBackgroundPhoto(nsid) {
  var method = "flickr.people.getPublicPhotos";
  var url = getURLForAPI(method);

  url += "&user_id=" + nsid;
  url += "&per_page=16&extras=url_h";

  $.getJSON(url).done(function(data) {
    var photoArray = data["photos"]["photo"];
    var arrayIndex = Math.floor(Math.random() * photoArray.length);
    var photo = photoArray[arrayIndex];
    $("#background-image").attr("src", photo["url_h"]);
  })
}

function getURLForAPI(method) {
  var params = ["format=" + format, "api_key=" + flickrKey, "method=" + method, "nojsoncallback=1"];
  return rootURL + params.join("&");
}