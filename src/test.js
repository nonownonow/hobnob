const elasticsearch = require('elasticsearch');

const client = elasticsearch.Client({
  host: 'http://localhost:9200',
});

client.index({
  index: 'hobnob',
  type: 'user',
  body: { email: 'nonownnow@gmail.com', password: '1234' },
})
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.log(err);
  });
