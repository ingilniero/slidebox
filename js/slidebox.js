/**
 * Slidebox Directive
 *
 * version 0.9
 * http://github.com/gus4no/slidebox
 *
 * by Gustavo Robles
 *
 * forked from http://github.com/keithjgrant/slidebox
 *
 * by Keith J Grant
 * http://elucidblue.com
 */
angular.module('Slidebox', [])

    .directive('slidebox', function slideboxDirective () {
      return {
        template: '<div class="slidebox-container">' +
            '<div class="slidebox">' +
            '<div ng-transclude class="slidebox-content"></div>' +
            '</div>' +
            '<ol class="slide-indicators"></ol>' +
            '<div class="slidebox-controls slidebox-left"></div>' +
            '<div class="slidebox-controls slidebox-right"></div>' +
            '</div>',
        replace: true,
        transclude: true,
        restrict: 'AE',
        scope: { length: '@length' },
        link: function ($scope, element, attrs) {
          $scope.$watch('length', function(newValue, oldValue){
            if(newValue != ''){
              length = newValue;
              content.children[0].style.width = itemWidth * length + 20 + 'px';
            }
          });

          $scope.$parent.$watch('vm.finishedRender', function(newValue, oldValue){
            if(typeof(newValue) != 'undefined'){
              setItemsWidth(itemWidth);
              setIndicators(true);
            }
          });

          var content = element.children()[0],
              list = element.children()[1],
              leftEl = element.children()[2],
              rightEl = element.children()[3],
              perPageDesktop = Number(attrs.perPageDesktop) || 4,
              perPageTablet = Number(attrs.perPageTablet) || 3,
              perPagePhone = Number(attrs.perPagePhone) || 1,
              itemWidth = (content.clientWidth - 20) / getPageSize(),
              items = content.children[0].children,
              interval, length, lastActiveSlidePosition;

          var hammer = Hammer(content, { touchAction: 'pan-y'});
          hammer.on('swipeleft', scrollRight);
          hammer.on('swiperight', scrollLeft);
          rightEl.addEventListener('click', scrollRight);
          leftEl.addEventListener('click', scrollLeft);
          window.addEventListener('orientationchange',recalculateWidths);
          window.onresize = recalculateWidths;


          function scrollLeft(){
            var limit = getScrollLimit(true);
            setActiveSlide(-1);
            interval = setInterval(function () {
              content.scrollLeft -= 10;
              if(content.scrollLeft <= limit || content.scrollLeft <= 0){
                clearInterval(interval);
              }
            }, 1);
          }

          function scrollRight(){
            var limit = getScrollLimit();
            setActiveSlide(1);
            var maxScroll = content.scrollWidth - content.clientWidth;
            interval = setInterval(function () {
              content.scrollLeft += 10;
              if(content.scrollLeft >= limit || content.scrollLeft >= maxScroll){
                clearInterval(interval);
              }
            }, 1);
          }

          function setItemsWidth(width){
            for(var i = 0; i < items.length; i++){
              if(_.include(items[i].classList, 'right-fix')){ break; }
              items[i].style.width = (width-40)+'px';
              items[i].style.margin = '20px';
              items[i].classList.add('slidebox-item');
            }
          }

          function recalculateWidths(){
            itemWidth = content.clientWidth / getPageSize();
            content.children[0].style.width = itemWidth * length + 20 + 'px';
            setItemsWidth(itemWidth);
            setIndicators();
          }

          function getPageSize(){
            var width = window.innerWidth;
            switch (true) {
              case(width > 980):
                return perPageDesktop;
                break;
              case (width < 980 && width > 769):
                return perPageTablet;
                break;
              case (width < 768):
                return perPagePhone;
                break;
            }
          }

          function getScrollLimit(toLeft){
            var containerWidth = getPageSize() * itemWidth;
            if(window.innnerWidth < 768){
              containerWidth = itemWidth;
            }

            if(toLeft){
              return content.scrollLeft - containerWidth
            }else{
              return content.scrollLeft + containerWidth
            }
          }

          function setIndicators(firstTime){
            var indicators = Math.ceil(items.length / getPageSize());
            list.innerText = '';
            for(var i = 0; i < indicators; i++){
              indicator = document.createElement('li');
              indicator.setAttribute('position', i);
              indicator.className = 'indicator';
              list.appendChild(indicator);
            }

            if(firstTime){ lastActiveSlidePosition = 0; }
            list.querySelectorAll("[position='"+ lastActiveSlidePosition +"']")[0].className += ' active';
          }

          function setActiveSlide(transition){
            var active = list.getElementsByClassName('active')[0]
            var position = Number(active.getAttribute('position')) + transition;
            var newActive = list.querySelectorAll("[position='"+ position +"']")[0];

            if(typeof(newActive) != 'undefined'){
              lastActiveSlidePosition = position;
              newActive.className += ' active';
              active.className = 'indicator';
            }
          }
        }
      };
    })


    .directive('slideboxItemsReady', function ($timeout) {
      return {
        restrict: 'A',
        link: function (scope, element, attr) {

          if (scope.$last === true) {
            $timeout(function() {
              scope.$parent.vm.finishedRender = true;
            });
          }
        }
      }
    });
