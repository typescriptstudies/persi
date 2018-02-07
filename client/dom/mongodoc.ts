class MongoDoc extends DomElement<MongoDoc>{
    doc:any={}

    constructor(){
        super("div")
        this.
            fs(FONT_SIZE)
    }    

    setDoc(doc:any):MongoDoc{
        this.doc=doc
        return this
    }

    build():MongoDoc{
        this.x.ac("mongodocmaindiv").h(
            JSON.stringify(this.doc,null,2)
        )
        return this
    }
}