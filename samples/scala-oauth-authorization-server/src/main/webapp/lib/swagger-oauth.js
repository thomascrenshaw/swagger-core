function handleLogin() {
  var service = "foo";
  var popupMask = $('#api-common-mask');
  var popupDialog = $('.api-popup-dialog');
  if(popupDialog.length > 0) popupDialog = popupDialog.last();
  else {
    popupDialog = $(
      [
        '<div class="api-popup-dialog">',
        '<div class="api-popup-title">Select OAuth2.0 Scopes</div>',
        '<div class="api-popup-content">',
          '<p>Scopes are used to grant an application different levels of access to data on behalf of the end user. Each API may declare one or more scopes.',
            '<a href="#">Learn how to use</a>',
          '</p>',
          '<p>' + service + ' API declares the following scopes. Select which ones you want to grant to APIs Explorer.</p>',
          '<ul class="api-popup-scopes">',
          '</ul>',
          '<p class="error-msg"></p>',
          '<div class="api-popup-actions"><button class="api-popup-authbtn api-button green" type="button">Authorize</button><button class="api-popup-cancel api-button gray" type="button">Cancel</button></div>',
        '</div>',
        '</div>'].join(''));
    $(document.body).append(popupDialog);
    var scopes = [];

    if(window.swaggerUi.api.authSchemes 
      && window.swaggerUi.api.authSchemes.oauth2
      && window.swaggerUi.api.authSchemes.oauth2.scopes) {
      scopes = window.swaggerUi.api.authSchemes.oauth2.scopes;
    }
    popup = popupDialog.find('ul.api-popup-scopes').empty();
    for (i = 0; i < scopes.length; i ++) {
      scope = scopes[i];
      str = '<li><input type="checkbox" id="scope_' + i + '" scope="' + scope.scope + '"/>' + '<label for="scope_' + i + '">' + scope.scope;
      if (scope.description) {
        str += '<br/><span class="api-scope-desc">' + scope.description + '</span>';
      }
      str += '</label></li>';
      popup.append(str);
    }
  }

  var $win = $(window),
    dw = $win.width(),
    dh = $win.height(),
    st = $win.scrollTop(),
    dlgWd = popupDialog.outerWidth(),
    dlgHt = popupDialog.outerHeight(),
    top = (dh -dlgHt)/2 + st,
    left = (dw - dlgWd)/2;

  popupDialog.css({
    top: (top < 0? 0 : top) + 'px',
    left: (left < 0? 0 : left) + 'px'
  });

  popupDialog.find('button.api-popup-cancel').click(function() {
    popupMask.hide();
    popupDialog.hide();
  });
  popupDialog.find('button.api-popup-authbtn').click(function() {
    popupMask.hide();
    popupDialog.hide();

    var authSchemes = window.swaggerUi.api.authSchemes;
    var host = window.location;
    var redirectUrl = host.protocol + '//' + host.host + "/o2c.html";
    var url = null;

    var p = window.swaggerUi.api.authSchemes;
    for (var key in p) {
      if (p.hasOwnProperty(key)) {
        var o = p[key].grantTypes;
        for(var t in o) {
          if(o.hasOwnProperty(t) && t === 'implicit') {
            var dets = o[t];
            url = dets.loginEndpoint.url + "?response_type=token";
            window.swaggerUi.tokenName = dets.tokenName;
          }
        }
      }
    }
    var scopes = []
    var o = $('.api-popup-scopes').find('input:checked');

    for(k =0; k < o.length; k++) {
      scopes.push($(o[k]).attr("scope"));
    }

    url += '&redirect_uri=' + encodeURIComponent(redirectUrl);
    url += '&realm=' + encodeURIComponent(realm);
    url += '&client_id=' + encodeURIComponent(clientId);
    url += '&scope=' + encodeURIComponent(scopes);

    window.open(url);
  });

  popupMask.show();
  popupDialog.show();
  return;
}


function handleLogout() {
  for(key in window.authorizations.authz){
    window.authorizations.remove(key)
  }
  $('.api-ic.ic-on').addClass('ic-off');
  $('.api-ic.ic-on').removeClass('ic-on');

  // set the info box
  $('.api-ic.ic-warning').addClass('ic-error');
  $('.api-ic.ic-warning').removeClass('ic-warning');
}

function initOAuth() {
  $('pre code').each(function(i, e) {hljs.highlightBlock(e)});
  $('.api-ic').click(function(s) {
    if($(s.target).hasClass('ic-off'))
      handleLogin();
    else {
      handleLogout();
    }
    false;
  });
}

function onOAuthComplete(token) {
  if(token) {
    if(token.error) {
      var checkbox = $('input[type=checkbox],.secured')
      checkbox.each(function(pos){
        checkbox[pos].checked = false;
      });
      alert(token.error);
    }
    else {
      var b = token[window.swaggerUi.tokenName];
      if(b){
        // set the checkbox
        $('.api-ic.ic-off').addClass('ic-on');
        $('.api-ic.ic-off').removeClass('ic-off');

        // set the info box
        $('.api-ic.ic-error').addClass('ic-warning');
        $('.api-ic.ic-error').removeClass('ic-error');
        window.authorizations.add("key", new ApiKeyAuthorization("Authorization", "Bearer " + b, "header"));
      }
    }
  }
}