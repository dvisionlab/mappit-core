var utils = require("./utils.js");
var filters = require("./filters.js");
var _ = require("underscore");

const { scl, viridis_mod, map, defaultsMargin } = require("./defaults.js");

// HIGH LEVEL FUNCTIONS

function plotByActivityType(sourceData) {
  // select only data with activities
  sourceData = filters.sanityCheck(sourceData, "activity");

  // parse int
  sourceData.forEach(function(d) {
    d.timestampMs = parseInt(d.timestampMs);
  });

  function getBestConfidence(act) {
    let max;
    if (act) {
      max = _.max(act, a => {
        return a.confidence;
      });
    }
    return max ? max.type : null;
  }

  function mapToColor(type) {
    return type ? map[type] : "blue";
  }

  let activities = _.pluck(sourceData, "activity");

  activities = _.map(activities, a => {
    return a ? a.pop().activity : null;
  });

  activities = _.map(activities, getBestConfidence);

  let colors = _.map(activities, mapToColor);

  var trace = {
    type: "scattermapbox",
    lat: _.pluck(sourceData, "latitudeE7").map(a => a / 1e7),
    lon: _.pluck(sourceData, "longitudeE7").map(a => a / 1e7),
    mode: "markers",
    marker: {
      size: 2,
      color: colors,
      colorscale: scl
    },
    text: []
  };

  var data = [trace];

  var layout = {
    autosize: false,
    heigth: 1000,
    width: 1000,
    hovermode: "closest",
    mapbox: {
      bearing: 0,
      center: {
        lat: utils.mean(_.pluck(sourceData, "latitudeE7").map(a => a / 1e7)),
        lon: utils.mean(_.pluck(sourceData, "longitudeE7").map(a => a / 1e7))
      },
      // domain: {
      //   x: [0, 1],
      //   y: [0, 1]
      // },
      pitch: 0,
      zoom: 9,
      style: "dark",
      heigth: 1000,
      width: 1000
    },
    margin: defaultsMargin
  };

  return { data: data, layout: layout };
}

function plotByVelocity(sourceData) {
  sourceData = _.filter(sourceData, loc => {
    return loc.velocity;
  });

  // select only data with velocity
  console.log(sourceData[0]);
  console.log(new Date(sourceData[0].timestampMs));

  // parse int
  sourceData.forEach(function(d) {
    d.timestampMs = parseInt(d.timestampMs);
  });

  let scl = [
    [0, "rgb(255,0,0)"],
    [25, "rgb(0, 0, 255)"],
    [50, "rgb(0, 255, 0)"]
  ];

  function mapToColor(type) {
    // let map = {
    //   IN_VEHICLE: "red",
    //   STILL: "yellow",
    //   IN_RAIL_VEHICLE: "green",
    //   IN_ROAD_VEHICLE: "red",
    //   IN_CAR: "red",
    //   ON_FOOT: "pink",
    //   WALKING: "green",
    //   ON_BYCICLE: "lightblue",
    //   UNKNOWN: "gray",
    //   TILTING: "gray" // ??
    // };
    return type ? type : 0;
  }

  let altitudes = _.pluck(sourceData, "altitude");

  // console.log(velocities);
  // velocities = _.map(velocities, a => {
  //   return a ? a.pop().activity : null;
  // });
  // console.log(velocities);
  // velocities = _.map(velocities, getBestConfidence);
  // console.log(velocities);

  let colors = _.map(altitudes, mapToColor);
  console.log(colors);

  // colors = Object.keys(colors);

  var trace = {
    type: "scattermapbox",
    lat: _.pluck(sourceData, "latitudeE7").map(a => a / 1e7),
    lon: _.pluck(sourceData, "longitudeE7").map(a => a / 1e7),
    mode: "markers",
    marker: {
      size: 2,
      color: colors,
      colorscale: scl
    },
    text: []
  };

  var data = [trace];

  var layout = {
    autosize: false,
    heigth: 1000,
    width: 1000,
    hovermode: "closest",
    mapbox: {
      bearing: 0,
      center: {
        lat: utils.mean(_.pluck(sourceData, "latitudeE7").map(a => a / 1e7)),
        lon: utils.mean(_.pluck(sourceData, "longitudeE7").map(a => a / 1e7))
      },
      // domain: {
      //   x: [0, 1],
      //   y: [0, 1]
      // },
      pitch: 0,
      zoom: 9,
      style: "dark",
      heigth: 1000,
      width: 1000
    },
    margin: {
      r: 0,
      t: 0,
      b: 0,
      l: 0,
      pad: 0
    }
  };

  return { data: data, layout: layout };
}

function plotHeatmap(sourceData) {
  var data = [
    {
      lon: _.pluck(sourceData, "longitudeE7").map(a => a / 1e7),
      lat: _.pluck(sourceData, "latitudeE7").map(a => a / 1e7),
      radius: 10,
      opacity: 0.7,
      z: _.map(sourceData, utils.countBros),
      // z: _.map(sourceData, d => 1),
      // z: utils.normalize(_.map(sourceData, utils.countBros)), // kill performances: use clustering!
      type: "densitymapbox",
      // coloraxis: "coloraxis", // setting this to use layout.coloraxis
      colorscale: viridis_mod,
      zsmooth: "best",
      // zmax: 250,
      // zmin: 0,
      hoverinfo: "skip"
    }
  ];

  var layout = {
    mapbox: { center: { lon: 10, lat: 50 }, style: "outdoors", zoom: 4 },
    // coloraxis: { colorscale: "Viridis" },
    // coloraxis: { colorscale: viridis_mod },
    title: { text: "gmaps positions" },
    width: 1200,
    height: 800,
    margin: defaultsMargin
  };

  return {
    data: data,
    layout: layout,
    config: { responsive: true }
  };
}

exports.plotByActivityType = plotByActivityType;
exports.plotByVelocity = plotByVelocity;
exports.plotHeatmap = plotHeatmap;

// PLOTLY opts
// {staticPlot: true} -> remove all uis
// {displayModeBar: true}
// {modeBarButtonsToRemove: ['toImage']}
// modeBarButtonsToAdd: [
//   {
//     name: 'color toggler',
//     icon: icon1,
//     click: function(gd) {
//       var newColor = colors[Math.floor(3 * Math.random())]
//       Plotly.restyle(gd, 'line.color', newColor)
//     }},
//   {
//     name: 'button1',
//     icon: Plotly.Icons.pencil,
//     direction: 'up',
//     click: function(gd) {alert('button1')
//   }}],
// {displaylogo: false}
// {responsive: true}
