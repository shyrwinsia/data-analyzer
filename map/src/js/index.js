var summary = d3.map();
var details = d3.map();
var stateIds = d3.map();
var stateNames = d3.map();
var appointments = [];
var max = 1000;
var color;

var svg = d3.select('#graph'),
  width = +svg.attr('width'),
  height = +svg.attr('height');
var path = d3.geoPath();

const tooltip = d3
  .select('body')
  .append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);

var promises = [
  d3.json('https://d3js.org/us-10m.v1.json'),
  d3
    .json('https://api.jsonbin.io/b/5f4c8259993a2e110d3ad302/latest')
    .then(function (d) {
      // details
      for (var i = 0; i < d.length; i++) {
        var dd = details.get(d[i].state);
        var dt = { status: d[i].status, count: d[i].count };
        if (dd) details.set(d[i].state, [...dd, dt]);
        else details.set(d[i].state, [dt]);
      }
    })
];

d3.json('https://api.jsonbin.io/b/5f7209b465b18913fc5564d5/latest').then(d => appointments = d);

d3.json('https://api.jsonbin.io/b/5f4c81c2514ec5112d12aa06/latest').then(
  function (d) {
    // summary
    for (var i = 0; i < d.length; i++) {
      summary.set(d[i].state, d[i].count);
      if (d[i].count > max) {
        max = d[i].count;
        console.log(max);
      }
    }

    d3.json('https://api.jsonbin.io/b/5f4c79f74d8ce4111385197d/latest')
      .then(function (d) {
        // states
        for (var i = 0; i < d.length; i++) {
          stateNames.set(d[i].code, d[i].name);
          stateIds.set(d[i].id, d[i].code);
        }

        color = d3
          .scaleLinear()
          .domain([0, max])
          .range(['#f2fdfe', '#079ca2'])
          .interpolate(d3.interpolateCubehelix);
      })
      .then(() => Promise.all(promises).then(ready));
  }
);

function ready([us]) {
  document.getElementById('preloader').style.display = 'none';
  document.getElementById('graph').style.display = 'block';

  svg
    .append('g')
    .attr('class', 'counties')
    .selectAll('path')
    .data(topojson.feature(us, us.objects.states).features)
    .enter()
    .append('path')
    .attr('fill', function (d) {
      var code = stateIds.get(Number(d.id));
      var summaryCode = summary.get(code);
      return summaryCode ? color(summaryCode) : '#ccc';
    })
    .attr('d', path)
    .on('mouseover', function (d) {
      var code = stateIds.get(Number(d.id));
      var name = stateNames.get(code);
      tooltip.transition().duration(300).style('opacity', 0.9);

      var tooltipString = `<h4>${name}</h4>
        <table><tbody>
        <tr><td class='number'>${summary.get(code) | 0
        }</td><td class='label'>Total Calls</td></tr>
        </tbody></table>`;
      var detailsString = '';
      var appointmentString = '';
      detailsFromCode = details.get(code);

      if (detailsFromCode) {
        detailsFromCode.forEach((e) => {
          detailsString += `<tr><td class='number'>${e.count}</td><td class='label'>${e.status}</td></tr>`;
        });
        tooltipString += `<table><tbody>${detailsString}</tbody></table>`;
      }

      appdates = appointments.filter(app => app.state === code);
      if (appdates.length > 0) {
        appdates.forEach((e) => {
          appointmentString += `<tr><td>${e.date}</td><td class='label'>${e.time}</td></tr>`;
        });
        tooltipString += `<p>Appointments</p><table><tbody>${appointmentString}</tbody></table>`;
      }

      tooltip
        .html(tooltipString)
        .style('left', d3.event.pageX + 15 + 'px')
        .style('top', d3.event.pageY - 28 + 'px');

      d3.select(this).attr('opacity', '0.9');
    })
    .on('mouseout', function (d) {
      tooltip.transition().duration(300).style('opacity', 0);

      d3.select(this).attr('opacity', '1');
    });

  svg
    .append('path')
    .datum(
      topojson.mesh(us, us.objects.states, function (a, b) {
        return a !== b;
      })
    )
    .attr('class', 'states');

  var w = 300,
    h = 50;

  var key = d3.select('#legend');

  var legend = key
    .append('defs')
    .append('svg:linearGradient')
    .attr('id', 'gradient')
    .attr('x1', '0%')
    .attr('y1', '100%')
    .attr('x2', '100%')
    .attr('y2', '100%')
    .attr('spreadMethod', 'pad');

  legend
    .append('stop')
    .attr('offset', '0%')
    .attr('stop-color', color(0))
    .attr('stop-opacity', 1);

  legend
    .append('stop')
    .attr('offset', '100%')
    .attr('stop-color', color(max))
    .attr('stop-opacity', 1);

  key
    .append('rect')
    .attr('width', w)
    .attr('height', h - 42)
    .style('fill', 'url(#gradient)')
    .attr('transform', 'translate(0, 18)');

  key
    .append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(95, 10)')
    .append('text')
    .attr('class', 'legend-text')
    .text('Frequency of Calls');

  key
    .append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(0, 38)')
    .append('text')
    .attr('class', 'legend-subtext')
    .text('Less Calls');

  key
    .append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(300, 38)')
    .append('text')
    .attr('text-anchor', 'end')
    .attr('class', 'legend-subtext')
    .text('More Calls');
}
