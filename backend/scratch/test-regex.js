
const url = 'mysql://4Qe8CQZuyB1e2jm.root:KI5AsN7Edys2nXJx@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/seminar';
const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

if (match) {
  console.log('Match found:');
  console.log('User:', match[1]);
  console.log('Pass:', match[2]);
  console.log('Host:', match[3]);
  console.log('Port:', match[4]);
  console.log('DB:', match[5]);
} else {
  console.log('No match found');
}
