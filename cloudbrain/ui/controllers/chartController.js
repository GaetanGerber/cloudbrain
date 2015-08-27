/* global angular */
(function () { 'use strict';

var baseURL = 'http://demo.apiserver.cloudbrain.rocks';

angular.module('cloudbrain')

.controller('chartController',
           ['$scope','$http','$interval','$log','apiService','dataService',
function   ( $scope , $http , $interval , $log , apiService , dataService ) {

    $scope.model = {
      deviceIds: ['opticorn'],
      deviceNames: ['muse'],
    };

    $scope.changeColor = function () {
        var color_val = 'rgba(255, 255, 255, 0.8)';
        $scope.chartPolar.options.chart.backgroundColor = color_val;
        $scope.chartBar.options.chart.backgroundColor = color_val;
      };


    apiService.refreshDeviceIds().then(function(response) {
      angular.copy(response.data, $scope.model.deviceIds);
    });

    apiService.refreshPhysicalDeviceNames().then(function(response) {
      angular.copy(response.data, $scope.model.deviceNames);
    });


      var setChannelSeries = function(data){
        var keys = Object.keys(data[0]);

        keys.forEach(function(key){
          if (key != 'timestamp'){
            for (var a=[],i=0;i<500;++i) a[i]=0;
            $scope.chartStock.series.push({name: key, data: a, id: key});
          }
        });
      };

      //$scope.url = 'http://mock.cloudbrain.rocks/data?device_name=openbci&metric=eeg&device_id=marion&callback=JSON_CALLBACK';
      $scope.showClick = false;
      $scope.chartMuse = false;
      $scope.getData = function (device, url) {

        dataService.startPowerBand(device.name, device.id, function(data) {
          // FIXME: considering only the first point right now...
          $scope.chartPolar.series[0].data.length = 0;
          $scope.chartPolar.series[0].data.push(data[0].gamma);
          $scope.chartPolar.series[0].data.push(data[0].delta);
          $scope.chartPolar.series[0].data.push(data[0].theta);
          $scope.chartPolar.series[0].data.push(data[0].beta);
          $scope.chartPolar.series[0].data.push(data[0].alfa);
        });

        $scope.chartPolar.title.text = device.name + ' ' + device.id;
        $scope.chartBar.title.text = device.name + ' ' + device.id;
        $scope.chartStock.title.text = device.name + ' ' + device.id;
        $scope.showClick=true;
        if ('muse' === device.name){
          $scope.chartMuse = true;
        }
        var metric = 'eeg';
        $scope.lastTimestamp = Date.now() * 1000; //microseconds
        $scope.cloudbrain = baseURL + '/data?device_name='+device.name+'&metric='+metric+'&device_id='+device.id+'&callback=JSON_CALLBACK&start='+$scope.lastTimestamp;
        $scope.chart3 = $scope.chartStock.getHighcharts();

        //initialize series data for charts
        $http.jsonp($scope.cloudbrain)
          .then(function(response){
            setChannelSeries(response.data);
          }, function(response){
            $log.log('fail');
        });

        $interval(function () {
          $http.jsonp($scope.cloudbrain)
          .then(function(response){
            $scope.lastTimestamp = response.data[response.data.length - 1].timestamp;

            response.data.forEach(function (dataPoints) {
              delete dataPoints.timestamp;

              for(var channel in dataPoints){
                $scope.chartStock.series[channel.split('_')[1]].data.push(dataPoints[channel]);
                if($scope.chartStock.series[channel.split('_')[1]].data.length > 300){
                  $scope.chartStock.series[channel.split('_')[1]].data.shift();
                }
              }

            });

          },
          function(response){
            $log.log('fail');
          });
        }, 100);
      };



      $scope.chartStock = {
        options: {
          chart: {
            zoomType: 'x',
            type: 'spline'
          },
          tooltip: {
            enabled: false
          },
          legend: {
            enabled: true
          },
          rangeSelector: {
            buttons: [{
              count: 100,
              type: 'millisecond',
              text: '2S'
            }, {
              count: 300,
              type: 'millisecond',
              text: '30S'
            }, {
              type: 'all',
              text: 'All'
            }],
            selected: 0,
            inputEnabled: false
          },

          navigator: {
            enabled: true
          }
        },
        series: [],
        title: {
          text: 'EEG'
        },
        useHighStocks: true
      };

      $scope.chartPolar = {
        options: {
          chart: {
            polar: true,
            type: 'spline',
            margin: [
            50,
            50,
            50,
            50
            ]
          },
          pane: {
            size: '80%'
          },
          tooltip: {
            shared: true,
            pointFormat: '<span style="color:{series.color}">{series.name}: <b>${point.y:,.0f}</b><br/>'
          },
          legend: {
            align: 'right',
            verticalAlign: 'top',
            layout: 'vertical'
          }
        },
        title: {
          text: 'EEG',
          x: - 80
        },
        xAxis: {
          categories: [
          'Gamma',
          'Delta',
          'Theta',
          'Beta',
          'Alpha'
          ],
          tickmarkPlacement: 'on',
          lineWidth: 0
        },
        yAxis: {
          gridLineInterpolation: 'polygon',
          lineWidth: 0,
          min: 0
        },
        series: [
        {
          name: 'Device 1',
          data: [
          43000,
          19000,
          60000,
          35000,
          17000
          ],
          pointPlacement: 'on',
          marker: {
            enabled: false,
            symbol: 'circle'
          }
        }
        ]
      };
      $scope.chartBar = {
        options: {
          chart: {
            margin: [
            50,
            50,
            50,
            50
            ],
            type: 'column'
          },
          pane: {
            size: '80%'
          },
          tooltip: {
            shared: true,
            pointFormat: '<span style="color:{series.color}">{series.name}: <b>${point.y:,.0f}</b><br/>'
          },
          legend: {
            align: 'right',
            verticalAlign: 'top',
            y: 70,
            layout: 'vertical'
          }
        },
        title: {
          text: 'EEG',
          x: - 80
        },
        xAxis: {
          categories: [
          'Gamma',
          'Delta',
          'Theta',
          'Beta',
          'Alpha'
          ],
          tickmarkPlacement: 'on',
          lineWidth: 0
        },
        yAxis: {
          gridLineInterpolation: 'polygon',
          lineWidth: 0,
          min: 0
        },
        series: [
        {
          name: 'Device 1',
          data: [
          43000,
          19000,
          60000,
          35000,
          17000
          ],
          pointPlacement: 'on',
          marker: {
            enabled: false,
            symbol: 'circle'
          }
        }
        ]
      };
    }
    ])

;

})();
