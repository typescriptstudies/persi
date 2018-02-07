class MongoColl extends DomElement<MongoColl>{
    mdocs:MongoDoc[]=[]

    constructor(){
        super("div")
        this.
            fs(FONT_SIZE)
    }    

    setDocs(docs:any[]):MongoColl{        
        this.mdocs=docs.map(doc=>new MongoDoc().setDoc(doc).build())
        return this
    }

    build():MongoColl{
        this.x.ac("mongocollmaindiv").a(this.mdocs)
        return this
    }
}