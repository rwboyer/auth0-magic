$('document').ready(function() {
  var content = $('.content');
  var loadingSpinner = $('#loading');
  content.css('display', 'block');
  loadingSpinner.css('display', 'none');;

  var webAuth = new auth0.WebAuth({
    domain: AUTH0_DOMAIN,
    clientID: AUTH0_CLIENT_ID,
    redirectUri: AUTH0_CALLBACK_URL,
    audience: 'https://' + AUTH0_DOMAIN + '/userinfo',
    responseType: 'token id_token',
    scope: 'openid profile email',
    leeway: 60
  });

  var loginStatus = $('.container h4');
  var loginView = $('#login-view');
  var homeView = $('#home-view');

  // buttons and event listeners
  var loginBtn = $('#login');
  var logoutBtn = $('#user');

  loginBtn.click(function(e) {
    e.preventDefault();
    webAuth.authorize();
  });

  logoutBtn.click(function(e){
    logout();
  });

  $("body").on("click", "#subscribers h4 a", function(e) {
    e.preventDefault();
    alert($(this).attr('id'));
  });

  function setSession(authResult) {
    // Set the time that the access token will expire at
    var expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }

  function logout() {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('profile');
    displayButtons();
  }

  function isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    var expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

  function handleAuthentication() {
    webAuth.parseHash(function(err, authResult) {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        webAuth.client.userInfo(authResult.accessToken, function(err, info) {
          if (info) {
            localStorage.setItem('profile', JSON.stringify(info));
            setSession(authResult);
            displayButtons();
          }
        });
      } else if (err) {
        console.log(err);
        alert(
          'Error: ' + err.error + '. Check the console for further details.'
        );
      }
    });
    //displayButtons();
  }

  function displayButtons() {
    if (isAuthenticated()) {
      $('#user').show().append('<a onclick="logout()">' + JSON.parse(localStorage.getItem('profile')).email + ' (Log out)</a>');
      $('#login').hide();
    } else {
      $('#login').show().append('<a onclick="login()">Log in</a>');
      $('#user').hide();
    }
  }

  displayButtons();
  handleAuthentication();

  function loadAdmin(){
    if(window.location.pathname == '/admin/'){
      //if(localStorage.getItem('id_token')){
        $.ajax({
          type : 'GET',
          url : 'https://wt-2d7b89d6f6ec895c908ace60bdebb4ea-0.run.webtask.io/newsletter/subscribers?webtask_no_cache=1',
          headers : {
            Authorization : 'Bearer ' + localStorage.getItem('id_token')
          }
        }).done(function(data) {
          for(var i = 0; i < data.length; i++){
            $('#subscribers').append('<h4>' + '<a id="' + data[i].coupon_code + '">' + data[i].coupon_code +  "</a> / " + data[i].exp_date + '</h4>');
          }
        });
      //} else {
        //window.location = '/';
      //}
    }
  }
  
  loadAdmin();

  $('#newsletter').submit(function(e){
    $.ajax({
      type : 'POST',
      url : 'https://wt-2d7b89d6f6ec895c908ace60bdebb4ea-0.run.webtask.io/newsletter/subscribe?webtask_no_cache=1',
      data : {email : $('#email').val()},
      dataType    : 'json',
      headers : {
        Authorization : 'Bearer ' + localStorage.getItem('token')
      }
    }).done(function(data) {
      if(data.statusCode == 200){
        $('#newsletter').hide();
        $('#response').append('<div class="alert alert-success">'+ data.message +'</div>')
      } else {
        $('#newsletter').hide();
        $('#response').append('<div class="alert alert-danger">'+ data.message +'</div>')
      }
    });
    e.preventDefault();
  });  
  
});
