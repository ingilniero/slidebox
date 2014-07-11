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
            if(!_.isUndefined(newValue)){
              content.children[0].style.width = itemWidth * newValue + 'px';
            }
          });

          $scope.$parent.$watch('vm.finishedRender', function(newValue, oldValue){
            if(!_.isUndefined(newValue)){
              setItemsWidth(itemWidth);
            }
          });

          var content = element.children()[0],
              leftEl = element.children()[1],
              rightEl = element.children()[2],
              perPage = Number(attrs.perPage) || 4,
              itemWidth = content.clientWidth / perPage,
              items = content.children[0].children,
              interval;


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

          function setItemsWidth(width){
            for(var i = 0; i < items.length; i++){
              items[i].style.width = (width-40)+'px';
              items[i].style.margin = '20px';
              items[i].classList.add('slidebox-item');
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
