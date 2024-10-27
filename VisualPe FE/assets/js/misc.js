var ChartColor = ["#5D62B4", "#54C3BE", "#EF726F", "#F9C446", "rgb(93.0, 98.0, 180.0)", "#21B7EC", "#04BCCC"];
var primaryColor = getComputedStyle(document.body).getPropertyValue('--primary');
var secondaryColor = getComputedStyle(document.body).getPropertyValue('--secondary');
var successColor = getComputedStyle(document.body).getPropertyValue('--success');
var warningColor = getComputedStyle(document.body).getPropertyValue('--warning');
var dangerColor = getComputedStyle(document.body).getPropertyValue('--danger');
var infoColor = getComputedStyle(document.body).getPropertyValue('--info');
var darkColor = getComputedStyle(document.body).getPropertyValue('--dark');
var lightColor = getComputedStyle(document.body).getPropertyValue('--light');

(function($) {
  'use strict';
  $(function() {
    var body = $('body');
    var sidebar = $('.sidebar');
    
    // Add active class to nav-link based on url dynamically
    function addActiveClass(element) {
      if (current === "") {
        if (element.attr('href').indexOf("index.html") !== -1) {
          element.parents('.nav-item').last().addClass('active');
          if (element.parents('.sub-menu').length) {
            element.closest('.collapse').addClass('show');
            element.addClass('active');
          }
        }
      } else {
        if (element.attr('href').indexOf(current) !== -1) {
          element.parents('.nav-item').last().addClass('active');
          if (element.parents('.sub-menu').length) {
            element.closest('.collapse').addClass('show');
            element.addClass('active');
          }
        }
      }
    }

    var current = location.pathname.split("/").slice(-1)[0].replace(/^\/|\/$/g, '');
    $('.nav li a', sidebar).each(function() {
      var $this = $(this);
      addActiveClass($this);
    });

    // Sidebar toggle
    $('[data-toggle="minimize"]').on("click", function() {
      body.toggleClass('sidebar-icon-only');
    });

    // Fullscreen
    $("#fullscreen-button").on("click", function() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });

    // Banner Display
    if ($.cookie && $.cookie('purple-free-banner') !== "true") {
      $('#proBanner').addClass('d-flex');
      $('.navbar').removeClass('fixed-top');
    } else {
      $('#proBanner').addClass('d-none');
      $('.navbar').addClass('fixed-top');
    }

    // Close Banner Button
    $('#bannerClose').on('click', function() {
      $('#proBanner').addClass('d-none').removeClass('d-flex');
      $('.navbar').addClass('fixed-top');
      var date = new Date();
      date.setTime(date.getTime() + 24 * 60 * 60 * 1000); // 1 day
      $.cookie('purple-free-banner', "true", { expires: date, path: '/' });
    });
  });
})(jQuery);
