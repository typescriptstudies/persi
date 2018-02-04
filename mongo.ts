const mongodb = require('mongodb')

module.exports.getCollections=getCollections

let MONGODB_URI = process.env.MONGODB_URI

console.log(`mongo uri ${MONGODB_URI}`)

let db:any = null

let collections:{[id:string]:any}={x:3}

function getCollectionsHash(){return collections}
module.exports.getCollectionsHash=getCollectionsHash

try{
    mongodb.connect(MONGODB_URI, function(err:any, conn:any){
        if (err){
            console.log(err)      
        }else{
            db = conn
            console.log(`connected to MongoDB database < ${db.databaseName} >`)
            getCollections()            
        }
    })
}catch(err){
    console.log(err)
}

function getCollections(){    
    if(db!=null){        
        collections={}        
        db.collections().then((cols:any)=>
        cols.map((coll:any)=>
            coll.stats().then((stats:any)=>{
                let ns=stats.ns
                let nsparts=ns.split(".")
                let name=nsparts.slice(1).join(".")
                let statss={
                    name:name,
                    count:stats.count,
                    size:stats.size
                }
                if(name!="system.indexes") collections[name]=statss
            })
        ))
    }
}