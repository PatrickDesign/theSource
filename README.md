# theSource
A crowdfunding website focused on solving the 17 SDG goals

To run this program, after cloning the repo, run:

```
npm init -y
```

Then:

```
npm install --save
printf '%s\n' 'const uri = "mongodb://patrickSource:source@cluster0-shard-00-00-28qcy.mongodb.net:27017,cluster0-shard-00-01-28qcy.mongodb.net:27017,cluster0-shard-00-02-28qcy.mongodb.net:27017/sourceDB?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true";' 'module.exports = uri;' > connectionString.js
```

Then to run the program:

```
node app.js
```
