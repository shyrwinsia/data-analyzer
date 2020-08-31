var promises = [
  d3.json('https://d3js.org/us-10m.v1.json'),
  d3
    .json('https://api.jsonbin.io/b/5f4c8259993a2e110d3ad302/latest')
    .then(function (d) {
      // details
    }),
  d3
    .json('https://api.jsonbin.io/b/5f4c81c2514ec5112d12aa06/latest')
    .then(function (d) {
      // summary
    }),
  d3
    .json('https://api.jsonbin.io/b/5f4c79f74d8ce4111385197d/latest')
    .then(function (d) {
      // states
      for (var i = 0; i < d.length; i++) {
        stateNames.set(d[i].id, d[i].name);
      }
    })
];

Promise.all(promises).then(ready);

var svg = d3.select('svg'),
  width = +svg.attr('width'),
  height = +svg.attr('height');

var summary = d3.map();
var stateNames = d3.map();

var path = d3.geoPath();

var color = d3.scaleThreshold().domain(d3.range(0, 9)).range(d3.schemeBlues[9]);
var colorRange = ['#deebf7', '#08306b'];

function ready([us]) {
  console.log('in ready', topojson.feature(us, us.objects.states).features);
  console.log('statenames', stateNames);
  console.log('summary', summary);

  svg
    .append('g')
    .attr('class', 'counties')
    .selectAll('path')
    .data(topojson.feature(us, us.objects.states).features)
    .enter()
    .append('path')
    .attr('fill', function (d) {
      var sn = stateNames.get(d.id);
      // d.rate = unemployment.get(stateNames.get(d.id)) || 0;
      d.rate = 0;
      var col = color(d.rate);
      if (col) {
        return col;
      } else {
        return '#ffffff';
      }
    })
    .attr('d', path)
    .append('title');

  svg
    .append('path')
    .datum(
      topojson.mesh(us, us.objects.states, function (a, b) {
        return a !== b;
      })
    )
    .attr('class', 'states')
    .attr('d', path);
}
