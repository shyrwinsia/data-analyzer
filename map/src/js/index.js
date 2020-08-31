var promises = [
  d3.json('https://d3js.org/us-10m.v1.json'),
  d3
    .json('https://api.jsonbin.io/b/5f4c8259993a2e110d3ad302/latest')
    .then(function (d) {
      console.log(d);
    }),
  d3
    .json('https://api.jsonbin.io/b/5f4c81c2514ec5112d12aa06/latest')
    .then(function (d) {
      console.log(d);
    }),
  d3
    .json('https://api.jsonbin.io/b/5f4c79f74d8ce4111385197d/latest')
    .then(function (d) {
      console.log(d);
    })
];

Promise.all(promises);
