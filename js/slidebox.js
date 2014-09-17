/**
 * Slidebox Directive
 *
 * version 0.11
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
              content.children[0].style.width = itemWidth * length + 'px';
            }
          });

          $scope.$parent.$watch('vm.finishedRender', function(newValue, oldValue){
            if(newValue == true){
              items = content.children[0].getElementsByClassName('slidebox-item');
              setItemsWidth(itemWidth);
              setIndicators(true);
              var hammer = Hammer(content, { touchAction: 'pan-y'});
              hammer.on('swipeleft', scrollRight);
              hammer.on('swiperight', scrollLeft);
              rightEl.addEventListener('click', scrollRight);
              leftEl.addEventListener('click', scrollLeft);
              window.addEventListener('orientationchange',recalculateWidths);
              window.addEventListener('resize', recalculateWidths);
              updateLeftLimitStatus();
            }
          });

          var content = element.children()[0],
              list = element.children()[1],
              leftEl = element.children()[2],
              rightEl = element.children()[3],
              perPageDesktop = Number(attrs.perPageDesktop) || 4,
              perPageTablet = Number(attrs.perPageTablet) || 3,
              perPagePhone = Number(attrs.perPagePhone) || 1,
              itemWidth = content.clientWidth / getPageSize(),
              items, interval, length, lastActiveSlidePosition;


          function scrollLeft(){
            var limit = getScrollLimit(true);
            var maxScroll = getMaxScroll();
            setActiveSlide(-1);
            interval = setInterval(function () {
              content.scrollLeft -= 10;

              updateLeftLimitStatus();
              updateRightLimitStatus(maxScroll);

              if(content.scrollLeft <= limit || content.scrollLeft <= 0){
                clearInterval(interval);
              }

            }, 1);
          }

          function updateLeftLimitStatus() {
            angular.element('.slidebox-left')
                .toggleClass('is-left-limit-reached', content.scrollLeft == 0);
          }

          function updateRightLimitStatus(maxScroll) {
            angular.element('.slidebox-right')
                .toggleClass('is-right-limit-reached', content.scrollLeft == maxScroll);
          }

          function scrollRight(){
            var limit = getScrollLimit();
            setActiveSlide(1);
            var maxScroll = getMaxScroll();
            interval = setInterval(function () {
              content.scrollLeft += 10;

              updateLeftLimitStatus();
              updateRightLimitStatus(maxScroll);

              if(content.scrollLeft >= limit || content.scrollLeft >= maxScroll){
                clearInterval(interval);
              }
            }, 1);
          }

          function setItemsWidth(width){
            for(var i = 0; i < items.length; i++){
              if(_.include(items[i].classList, 'right-fix')){ break; }
              //-40 px because thats what the margin is supossed to fill in the stylesheet.
              items[i].style.width = (width-40)+'px';
            }
          }

          function recalculateWidths(){
            itemWidth = content.clientWidth / getPageSize();
            content.children[0].style.width = itemWidth * length + 'px';
            setItemsWidth(itemWidth);
            setIndicators();
          }

          function getPageSize(){
            var width = window.innerWidth;
            switch (true) {
              case(width > 980):
                return perPageDesktop;
                break;
              case (width < 980 && width >= 768):
                return perPageTablet;
                break;
              case (width < 768):
                return perPagePhone;
                break;
            }
          }

          function getMaxScroll() {
            return content.scrollWidth - content.clientWidth;
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
              var indicator = document.createElement('li');
              indicator.setAttribute('position', i);
              indicator.className = 'indicator';
              list.appendChild(indicator);
            }

            if(firstTime){ lastActiveSlidePosition = 0; }
            var indicator = list.querySelectorAll("[position='"+ lastActiveSlidePosition +"']")[0];
            if(typeof(indicator) != 'undefined'){
              indicator.classList.add('active');
            }
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
