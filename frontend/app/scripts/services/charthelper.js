'use strict';

var app = angular.module('kauriApp');
    
// Provides functions that help with the generation of charts.
app.factory('ChartHelper', function(ChartColours, $rootScope) {
   	var ChartHelper = {};

    // Set the tick colour for chart to use a different colour when the axis is beyond its set limit.
    ChartHelper.setTickColour = function(scale, axisLimit) {
      var tickOptions = scale.options.ticks;
      if (scale.max > axisLimit) {
        tickOptions.fontColor = '#007EA8';
      } else {
        tickOptions.fontColor = null;
      }
    };

    // Gets the time offset since midnight.
    ChartHelper.getAmountOutFromMidnight = function(timestamp, reverseOrder) {
      var offset = (timestamp - 60*60*12 - 1) % (60*60*24); // match on midday GMT which is midnight in +12 NZ.
      if (reverseOrder) {
        offset = (60*60*24) - offset;
      }
      return offset;
    };

    // Gets the timestamp of the last midnight.
    ChartHelper.getLastMidnightTimestamp = function(timestamp, reverseOrder) {
      var outBy = ChartHelper.getAmountOutFromMidnight(timestamp, reverseOrder);
      if (reverseOrder){
        return timestamp + outBy; 
      } else {
        return timestamp - outBy;
      }
    };

    // Returns true if the end of the day has been missed.
    ChartHelper.hasMissedEndOfDay = function(timeSinceLastReading, currentTimestamp, reverseOrder) {
      var outBy = ChartHelper.getAmountOutFromMidnight(currentTimestamp, reverseOrder);
      // Either the timestamp is perfectly on midnight or midnight was missed.
      return outBy < timeSinceLastReading;    
    };

    // Gets the dataset parameter options for an energy source.
    ChartHelper.getEnergySourceDatasetTemplate = function(label, colourKey) {
      return $.extend({
        label: label,
        fill: true,
        pointRadius: 0,
        pointHitRadius: 4,
        lineTension: 0.1
      }, ChartColours.getChartColourFields(colourKey));
    };

    // Gets the callback options for a chart showing Wh sources.
    ChartHelper.getEnergySourceChartCallbacks = function() {
      return {
        title : function(tooltips, data) {
          return moment.unix(tooltips[0].xLabel).format($rootScope.dateTimeFormat);
        },
        label : function(tooltipItem, data) {
          var label = data.datasets[tooltipItem.datasetIndex].label;
          var value = Math.abs(tooltipItem.yLabel).toFixed(0) + 'Wh'; 
          return label + ': ' + value;
        }
      };
    };

    // Sorts energy sources in place.
    ChartHelper.sortEnergySources = function(energySources) {
      energySources.sort(function(a, b) {
        return a.sortIndex - b.sortIndex;
      });
    };

    // Returns an object of: {order : [], sources : []}.
    ChartHelper.getEnergySourceDetails = function(building, nonRenewableAtBottom) {
      var renewableSourceOrder = [];
      var nonRenewableSourceOrder = [];
      var allEnergySources = {};

      // Setup the energy sources,
      angular.forEach(building.energySources, function(source) {
        source.data = [];
        
        allEnergySources[source.id] = source;
        if (source.isRenewable) {
          renewableSourceOrder.push(allEnergySources[source.id]);
        } else {
          nonRenewableSourceOrder.push(allEnergySources[source.id]);
        }
      });

      var allSourceOrder;
      if (nonRenewableAtBottom) {
        // Sort the renewable and non-renewable energy sources using their sort indexes. 
        ChartHelper.sortEnergySources(renewableSourceOrder);
        ChartHelper.sortEnergySources(nonRenewableSourceOrder);

        // Combine the lists.
        allSourceOrder = $.merge($.merge([], nonRenewableSourceOrder), renewableSourceOrder);
      } else {
        // Combine non-renewable and renewable sources.
        allSourceOrder = $.merge($.merge([], nonRenewableSourceOrder), renewableSourceOrder);

        // Sort the energy sources using their sort indexes.
        ChartHelper.sortEnergySources(allSourceOrder);
      }
      
      return {
        order : allSourceOrder,
        sources : allEnergySources
      };
    };

    return ChartHelper;
});
