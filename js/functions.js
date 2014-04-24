var configServerUrl = null;
var configServerWait = null
var configHistQtde = null;
var configOrderSendMail = null;
var timeWait = null;
var loadSplashScreen = null;
var isSendMail = false;

/* carrega as configuracoes locais */
getConfigs();

/* obtem a url da pagina atual */
var url = window.location.href.split('/');

/* obtem a pagina atual (obtida atraves da url) */
var page = url[(url.length - 1)];

function onDeviceReady() {
  /* define as funcoes a seres executadas ao acionar os botoes fisicos */
  document.addEventListener("menubutton", onMenuKeyDown, false);
  document.addEventListener("backbutton", onBackKeyDown, false);

//  var loadSplashScreen = sessionStorage.getItem('splassh');
//  if (splashScreen == null) {
//    /* oculta o splashscreen */
//    navigator.splashscreen.show();
//    sessionStorage.setItem('splassh', '1');
//  }
}

/**
 * onMenuKeyDown
 * Funcao para o botao fisico 'menu'
 */
function onMenuKeyDown() {
//  if (page == "index.html")
//    $('#show_menu').click();
}

/**
 * onBackKeyDown
 * Funcao para o botao fisico 'voltar'
 */
function onBackKeyDown() {
//  if (page == "index.html")
//    $('#mask_white').click();
//  else
//    $('.show_menu').click();
}

function menuShow() {
  showMaskWhite();
  $('body').addClass('menu-active');
}

function menuHide() {
  hideMaskWhite();
  $('body').removeClass('menu-active');
}

function menuToggle() {
  if ($('body').hasClass('menu-active')) {
    menuHide();
  } else {
    menuShow();
  }
}

/**
 * verificaConfiguracoes
 * Funcao para verificar as configuracoes do aplicativo
 */
function verificaConfiguracoes() {
  /* se a pagina atual nao for a tela de configuracoes e a url do servidor nao estiver configurada
   * redireciona o usuario para a tela de configuracoes para definir a url do servidor */
  if (page != 'configuracoes.html' && (configServerUrl == null || !(configServerUrl.length > 10))) {
    goToPage('configuracoes.html');
  }

  /* caso a pagina atual seja a de configuracoes seta as configuracoes nos campos */
  else if (page == 'configuracoes.html') {

    /* verifica se a url do servidor esta preenchida
     * caso nao esteja preenche com vazio */
    if (configServerUrl == null || !(configServerUrl.length > 10)) {
      $('input[name=configServerUrl]').val('');
      $('#configServerUrl').click();
    }

    else {
      $('input[name=configServerUrl]').val(configServerUrl);
    }

    if (configServerWait > 0) {
      $('input[name=configServerWait]').val(configServerWait / 1000);
    }

    if (configHistQtde > 0) {
      $('input[name=configHistQtde]').val(configHistQtde);
    }

    if (configOrderSendMail == 1) {
      $('#configOrderSendMail').addClass('checkboxon');
      $('input[name=configOrderSendMail]').val('1');
    } else {
      $('#configOrderSendMail').addClass('checkboxoff');
      $('input[name=configOrderSendMail]').val('0');
    }

    if (isLogado() && getUsuarioPermissao() == 2)
      $('#configs .hide').show();
    else
      $('#configs .hide').remove();
  }
}

/**
 * setConfigs
 * Funcao para salvar as configuracoes do aplicativo
 */
function setConfigs(config, value) {
  var error = false;

  switch (config) {
    case 'configServerUrl':
      /* seta as configuracoes do servidor localmente */
      if (value.length > 10) {
        localStorage.setItem('configServerUrl', value);
      } else {
        error = true;
      }
      break;
    case 'configServerWait':
      /* seta as configuracoes do timeout localmente */
      if (value > 0) {
        localStorage.setItem('configServerWait', value * 1000);
      }
      break;
    case 'configHistQtde':
      /* seta as configuracoes do historico localmente */
      if (value > 0) {
        localStorage.setItem('configHistQtde', value);
      }
      break;
    case 'configOrderSendMail':
      /* seta as configuracoes do orcamento */
      if (value == 1) {
        localStorage.setItem('configOrderSendMail', '1');
      } else {
        localStorage.setItem('configOrderSendMail', '0');
      }
      break;
  }

  /* exibe mensagem de confirmacao */
  if (error) {
    showDialog("Aviso", "Nem todas configura&ccedil&otilde;es foram salvas", null, null, "Fechar", "hideDialog()");
  }
//  else {
//    toast("Configura&ccedil&otilde;es salva com sucesso");
//  }
}

/**
 * getConfigs
 * Funcao para carregar as configuracoes do aplicativo
 */
function getConfigs() {
  /* configuracoes do servidor */
  configServerUrl = localStorage.getItem('configServerUrl');

  /* caso nao tenha definido a url do servidor preenche com vazio */
  if (configServerUrl == null || !(configServerUrl.length > 10)) {
    configServerUrl = '';
  }

  /* configuracoes do timeout para as requisicoes ajax ao servidor */
  configServerWait = localStorage.getItem('configServerWait');

  /* caso nao tenha definido um timeout preenche com o padra o de 10 segundos */
  if (configServerWait == null) {
    configServerWait = 30000;
  }

  /* configuracoes do historico */
  configHistQtde = localStorage.getItem('configHistQtde');

  /* configuracoes do orcamento */
  configOrderSendMail = localStorage.getItem('configOrderSendMail');

  /* caso nao tenha definido um limite para o historico
   * preenche com limite padrao de 100 registros*/
  if (configHistQtde == null) {
    configHistQtde = 100;
  }
}

/**
 * verificaLogado
 * Funcao para verificar se existe usuario logado no aplicativo
 */
function verificaLogado() {
  /* obtem os dados do usuario na sessao */
  var logado = new Boolean(sessionStorage.getItem('logado')).valueOf();

  /* caso nao haja usuario logado */
  if (logado !== true) {

    /* exibe a mascara para bloquear o acesso aos botoes da tela */
    showMask();

    /* exibe o popup de login para o usuario */
    $('#login').fadeIn();
  } else {
    setUserInfo();
  }
}

/**
 * wsLogar
 * Funcao para executar a requisicao de busca de usuario
 */
function wsLogar() {
  /* obtem os dados para execucao da requisicao */
  var usuario = $('input[name=usuario]').val();
  var senha = $('input[name=senha]').val();

  if ((usuario.length > 0) && (senha.length > 0)) {

    /* ativa a tela de loading */
    showLoading();

    /* executa a requisicao via ajax */
    $.ajax({
      url: configServerUrl + '/getFuncionario.php',
      type: 'GET',
      dataType: 'jsonp',
      data: {
        'dados': { 'wscallback': 'wsResponseLogar',
                    'usuario': { 'apelido': usuario, 'senha': senha }
                  }
      }
    });

    /* oculta o popup de login */
    $('#login').fadeOut();
  }
}

/**
 * wsResponseLogar
 * Funcao para tratar o retorno da funcao 'wsLogar'
 * @param {json} response
 */
function wsResponseLogar(response) {
  /* faz o parser do json */
  response = JSON.parse(response);

  /* em caso de erro */
  if (response.wsstatus == 0) {
    var msg = 'Funcion&aacute;rio n&atilde;o cadastrado!';
    var error = response.wserror;
    if (error.length > 0)
      msg = error;
    showDialog("Produto", msg, null, null, "Fechar", "hideDialog()");
    showDialog("Autentica&ccedil;&atilde;o", msg, null, null, "Fechar", "goToPage('index.html')");
  }
  /* em caso de sucesso */
  else if (response.wsstatus == 1) {

    /* guarda os dados do usuario na sessao */
    sessionStorage.setItem('user', JSON.stringify(response.wsresult));

    /* seta os dados do usuario na tela */
    setUserInfo();

    /* seta a variavel para informar que ha um usuario logado e guarda na sessao */
    sessionStorage.setItem('logado', true);

    /* carrega os ambientes cadastrados no saci */
    wsGetAmbiente();

    hideDialog();
    hideMask();
    toast('Login realizado com sucesso');
  }
}

function exibeDialogLogout() {
  /* pede confirmacao */
  showDialog("Logout", "Desconectar usu&aacute;rio?", "Cancelar", "hideDialog()", "Desconectar", "logout()");
}
/**
 * logout
 * Funcao para desconectar o usuario logado
 */
function logout() {

  /* limpa os dados da sessao do usuario */
  sessionStorage.clear();
  goToPage('index.html');
}

function exibeDialogSendEmailOrcameto(codigo, origem, acao, data, cliente) {
  var msg = "";
  switch (origem) {
    case 'historico':
      msg = "<strong>Or&ccedil;amento:</strong> " + codigo + "<br/>";
      if (cliente.length > 0)
        msg += "<strong>Cliente:</strong> " + cliente + "<br/>";
      break;
    default:
      msg = "";
  }
  if (configOrderSendMail == 1) {
    // verifica se ha email cadastrado
    var email = getUsuarioEmail();
    if (email.length > 0) {
      msg += "Deseja receber este or&ccedil;amento em seu e-mail?";
      showDialog("Or&ccedilamento", msg, "N&atilde;o", "hideDialog()", "Sim", "wsSendEmailOrcamento('" + codigo + "')");
    }
    else {
      msg += "N&atildeo h&aacute e-mail cadastrado!<br/>";
      msg += "Favor cadastrar o email do funcion&aacuterio no SACI e efetuar o login novamente.";
      showDialog("Or&ccedilamento", msg, null, null, "OK", "hideDialog()");
    }
  }
  else {
    showDialog("Or&ccedil;amento", msg, null, null, "OK", "hideDialog()");
  }
}
function wsSendEmailOrcamento(codigo) {
  isSendMail = true;
  showLoading();

  var func_name = getUsuarioNome();
  var func_email = getUsuarioEmail();

  $.ajax({
    url: configServerUrl + '/sendOrcamentoEmail.php',
    type: "GET",
    dataType: "jsonp",
    data: {
      'dados': { 'wscallback': 'wsResponseSendEmailOrcamento',
                  'orcamento': { 'codigo': codigo, 'func_name': func_name, 'func_email': func_email }
                }

    }
  });
}
function wsResponseSendEmailOrcamento(response) {
  /* faz o parser do json */
  response = JSON.parse(response);

  /* em caso de erro */
  if (response.wsstatus == 0) {
    var msg = 'N&atilde;o foi poss&iacute;vel enviar o or&ccedil;amento por e-mail!';
    var error = response.wserror;
    if (error.length > 0)
      msg = error;
    showDialog("Erro", msg, null, null, "Fechar", "hideDialog()");
  }
}

/**
 * setUserInfo
 * Funcao para setar os dados do usuario logado na tela
 */
function setUserInfo() {
  /* obtem os dados do usuario na sessao */
  var nome = getUsuarioNome();
  nome = nome.substr(0, 30);
  var email = getUsuarioEmail();

  // seta os dados na tela
  $('#slide-menu #usuario #info #nome').html(nome);
  $('#slide-menu #usuario #info #email').html(email);

  /* verifica as permissoes do usuario */
  verificaPermUsuario();
}

/**
 * getUsuarioCodigo
 * Funcao para obter o codigo do funcionario logado
 */
function getUsuarioCodigo() {
  /* obtem os dados do funcionario na sessao */
  var user = JSON.parse(sessionStorage.getItem('user'));
  return user.codigo;
}

/**
 * getUsuarioNome
 * Funcao para obter o nome do funcionario logado
 */
function getUsuarioNome() {
  /* obtem os dados do funcionario na sessao */
  var user = JSON.parse(sessionStorage.getItem('user'));
  var nome = user.nome.split(" ");
  return nome[0] + " " + nome[nome.length - 1];
}

/**
 * getUsuarioEmail
 * Funcao para obter o email do funcionario logado
 */
function getUsuarioEmail() {
  /* obtem os dados do funcionario na sessao */
  var user = JSON.parse(sessionStorage.getItem('user'));
  return user.email;
}

/**
 * getUsuarioLoja
 * Funcao para obter a loja do funcionario logado
 */
function getUsuarioLoja() {
  /* obtem os dados do funcionario na sessao */
  var user = JSON.parse(sessionStorage.getItem('user'));
  return user.loja;
}

/**
 * getUsuarioUsuario
 * Funcao para obter o usuario do funcionario logado
 */
function getUsuarioUsuario() {
  /* obtem os dados do funcionario na sessao */
  var user = JSON.parse(sessionStorage.getItem('user'));
  return user.usuario;
}

/**
 * getUsuarioPermissao
 * Funcao para obter a permissao do funcionario logado
 */
function getUsuarioPermissao() {
  /* obtem os dados do funcionario na sessao */
  var user = JSON.parse(sessionStorage.getItem('user'));
  return user.permissao;
}

function isLogado() {
  return sessionStorage.getItem('logado');
}

function verificaPermUsuario() {
  /* obtem os dados do funcionario na sessao */
  var permissao = getUsuarioPermissao();
  /**
   * 1 - vendedor (permissao basico para acessar o aplicativo)
   * 2 - gerente ou diretor (permissao avancada para acessar o aplicativo e configuracoes)
   */
  switch (permissao) {
    case 2:
      $('#slide-menu #botoes .settings').show();
  }
}

function exibeDialogAppClose() {
  /* pede confirmacao */
  showDialog("Sair", "Fechar aplicativo?", "Cancelar", "hideDialog()", "Fechar", "appClose()");
}
/**
 * appClose
 * Funcao para fechar o aplicativo
 */
function appClose() {
  /* 'mata' o aplicativo */
  if (navigator.app) {
    navigator.app.exitApp();
  }

  else if (navigator.device) {
    navigator.device.exitApp();
  }
}

/**
 * gallery
 * Funcao para exibir uma imagem com possibilidade de zoom
 * @param {url} img
 */
function gallery(codPrd, img, indiceImg) {
  /* redireciona para um pagina limpa que possibilita o 'zoom pinca' */
  window.location.href = 'gallery.html?prd=' + codPrd + '&img=' + img + '&indiceImg=' + indiceImg;
}

/**
 * galleryClose
 * Funcao para retornar a tela do produto
 */
function galleryClose(codPrd, indiceImg) {
  /* redireciona de volta para a tela principal para carregar o produto */
  window.location.href = 'index.html?codPrd=' + codPrd + '&indiceImg=' + indiceImg;
}

/**
 * goToPage
 * Funcao para carregar pagina
 * @param {url} page
 */
function goToPage(page) {
  window.location.href = page;
}

/**
 * clearStorage
 * Funcao para limpar os dados locais do aplicativo (todas os dados do aplicativo serao removidos)
 */
function clearStorage() {
  localStorage.clear();
}

function showDialog(title, msg, text_cancel, func_cancel, text_ok, func_ok, prompt, timeout, loading) {
  hideDialog();
  showMask();

  $("#modal").css('margin-top', '-100px');
  $("#modal p").css('text-align', 'left');
  $("#modal h1").hide();
  $("#modal input").hide();
  $("#modal #botoes").hide();
  $("#modal #botoes button").hide();

  if (title) {
    $("#modal h1").html(title).show();
  }

  if (prompt) {
    $("#modal input").show();
  }

  if (text_cancel || text_ok) {
    $("#modal #botoes").show();
    if (text_cancel) {
      $("#modal #botoes button").show();
    } else {
      $("#modal #botoes button").eq(1).show();
    }
  }

  if (loading) {
    msg = '<img src="img/loading.gif"/>';
    $("#modal").css('margin-top', '-60px');
    $("#modal p").css('text-align', 'center');
  }

  $("#modal p").html(msg);
  $("#modal #btcancel").html(text_cancel).attr('onclick', func_cancel);
  $("#modal #btok").html(text_ok).attr('onclick', func_ok);

  $("#modal").show();

  if (loading) {
    verifyTimeOut(timeout);
  }
}
function hideDialog() {
  hideMask();
  $('#modal input').val("");
  $("#modal").hide();
}
function showMask() {
  if (!$('.mask').is(':visible')) {
    var wid_w = $(window).width();
    var hei_w = $(window).height();
    var hei = wid_w;
    var wid = wid_w;
    if (hei_w > wid_w) {
      hei = hei_w;
      wid = hei_w;
    }
    var mask = $("<div>");
    $(mask).addClass('mask');
    if (isLogado()) {
      $(mask).attr('onclick', '$(this).hide(); hideDialog();');
    }
    $(mask).css({'width': (wid * 2), 'height': (hei * 2), 'overflow-y': 'none', 'overflow-x': 'none'});
    $("body").append(mask);
    $(mask).show();
  }
}
function hideMask() {
  if ($('.mask_full').is(':visible')) {
    $('.mask_full').hide();
    showMask();
    $('.mask').css('z-index', 8);
  } else {
    $('.mask').css('z-index', 3);
    $('.mask').hide();
    if ($('body').hasClass('menu-active'))
      $('.mask_full').show();
  }
  $('#changelog').hide();
  clearTimeout(timeWait);
}
function showMaskFull() {
  var wid_w = $(window).width();
  var hei_w = $(window).height();
  var hei = wid_w;
  var wid = wid_w;
  if (hei_w > wid_w) {
    hei = hei_w;
    wid = hei_w;
  }
  var mask = $("<div>");
  $(mask).addClass('mask_full');
  $(mask).attr('onclick', '$(this).hide(); hideDialog();');
  $(mask).css({'width': (wid * 2), 'height': (hei * 2)});
  $("body").append(mask);
  $(mask).fadeIn(300);
}
function hideMaskFull() {
  $('.mask_full').fadeOut(300);
  timeWait = window.setTimeout(function() {
    $('.mask_full').remove();
  }, 300);
}
function showMaskWhite() {
  var wid_w = $(window).width();
  var hei_w = $(window).height();
  var hei = wid_w;
  var wid = wid_w;
  if (hei_w > wid_w) {
    hei = hei_w;
    wid = hei_w;
  }
  var mask = $("<div>");
  $(mask).attr("id", "mask_white");
  $(mask).fadeIn(300);
  $('body').append(mask);
  window.setTimeout(function() {
    $('#mask_white').css({'width': (wid * 2), 'height': (hei * 2)});
  }, 400);
  var clickMask = new FastButton(document.getElementById('mask_white'), function(event) {
    menuHide();
  });
}
function hideMaskWhite() {
  $('#mask_white').fadeOut(300);
  timeWait = window.setTimeout(function() {
    $('#mask_white').remove();
  }, 300);
}
function verifyTimeOut(timeout) {
  if(isSendMail){
    timeWait = window.setTimeout(function() {
      hideDialog();
      hideMask();
      toast("O email est&aacute; sendo enviado");
    }, 10000);
    isSendMail = false;
  }

  else{
    timeWait = window.setTimeout(function() {
      if ($('#modal img').is(":visible")) {
        if (isLogado()) {
          showDialog("Conex&atilde;o", "N&atilde;o houve resposta do servidor! Favor verificar as configura&ccedil;&otilde;es", "Cancelar", "hideDialog()", "Configura&ccedil;&otilde;es", "goToPage('configuracoes.html')");
        } else {
          showDialog("Conex&atilde;o", "N&atilde;o houve resposta do servidor! Favor verificar as configura&ccedil;&otilde;es", "Cancelar", "goToPage('index.html')", "Configura&ccedil;&otilde;es", "goToPage('configuracoes.html')");
        }
      }
    }, timeout);
  }
}
function showLoading() {
  showDialog(null, null, null, null, null, null, null, configServerWait, 1);
}
function toast(msg) {
  //hideDialog();
  $('#toast').html(msg);
  $('#toast').fadeIn();
  setTimeout(function() {
    $('#toast').fadeOut();
  }, 3000);
}
function loadChangeLog() {
  $("#changelog").load('changelog.txt');
  window.setTimeout(function() {
    var changelog = $("#changelog").html();
    changelog = changelog.replace(/\n/g, '<br>');
    $("#changelog").html(changelog);
    $("#changelog").prepend('<button type="button" class="bt btshort bradius txt_right mask_red" onclick="hideChangeLog();">X</button>');
  }, 500);
}
function showChangeLog() {
  showMask();
  $('#changelog').show();
}
function hideChangeLog() {
  hideMask();
  $('#changelog').hide();
}