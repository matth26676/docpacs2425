$(function () {

  $('.header-container .title').rotator();

  $('.header-container h2').rotator({
    speed: 500,
    degree: 5,
    incrementor: 10,
    reverse: true,
  });

  $('.reset').on('click', function () {
    $('.header-container .title').rotator('reset');
    $('.header-container h2').rotator('reset');
    $('article').rotator('reset');
  });

  $('.restart').on('click', function () {
    $('.header-container .title').rotator();
    $('.header-container h2').rotator({
      speed: 500,
      degree: 5,
      incrementor: 10,
      reverse: true,
    });
  });

});