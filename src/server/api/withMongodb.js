module.exports = app =>
    function withMongodb(callback, options = {}) {
        return new Promise((resolve, reject) => {
            const MongoClient = require('mongodb').MongoClient
                // Connection URL
            const url = process.env.MONGO_URI || 'mongodb://localhost:27017'
                // Database Name
            const dbName = options.dbName || process.env.MONGO_DB
                // Use connect method to connect to the server
            MongoClient.connect(
                url,
                async function(err, client) {
                    const db = client.db(dbName)
                    try {
                        let r = await callback(db, client)
                        client.close()
                        resolve(r)
                    } catch (err) {
                        client.close()
                        reject(err)
                    }
                }
            )
        })
    }