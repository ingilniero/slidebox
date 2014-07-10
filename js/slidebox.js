/**
 * Slidebox Directive
 *
 * version 0.9
 * http://github.com/keithjgrant/slidebox
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
            '<div class="slidebox-controls slidebox-left"></div>' +
            '<div class="slidebox-controls slidebox-right"></div>' +
            '</div>',
        replace: true,
        transclude: true,
        restrict: 'AE',
        scope: { length: '@length' },
        link: function ($scope, element, attrs) {
          $scope.$watch('length', function(newValue, oldValue){
            if(newValue!=''){
              content.children[0].style.width = itemWidth * newValue + 'px';
            }
          });
          var content = element.children()[0],
              leftEl = element.children()[1],
              rightEl = element.children()[2],
              perPage = Number(attrs.perPage) || 4,
              itemWidth = content.clientWidth / perPage,
              interval,
              didScroll = true; // trigger an initial check on load

          if (attrs.contentClass) {
            content.children[0].className += ' ' + attrs.contentClass;
          }


          rightEl.addEventListener('click', function(){
            var limit = content.scrollLeft + content.clientWidth;
            var maxScroll = content.scrollWidth - content.clientWidth;
            interval = setInterval(function () {
              content.scrollLeft += 10;
              if(content.scrollLeft > limit || content.scrollLeft >= maxScroll){
                clearInterval(interval);
              }
            }, 1);
          });

          leftEl.addEventListener('click', function(){
            var limit = content.scrollLeft - content.clientWidth;
            interval = setInterval(function () {
              content.scrollLeft -= 10;
              if(content.scrollLeft < limit || content.scrollLeft == 0){
                clearInterval(interval);
              }
            }, 1);
          });

        }
      };
    });
