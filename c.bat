git add -A .

git reset -- server.js
git reset -- scheduler.js
git reset -- mongo.js
git reset -- api.js
git reset -- client/builder.js
git commit -m "%*"

git add -- server.js
git add -- scheduler.js
git add -- mongo.js
git add -- api.js
git add -- client/builder.js
git commit -m "%* js"
