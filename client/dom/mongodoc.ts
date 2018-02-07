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
        let content=""        
        for(let key in this.doc){
            let value=this.doc[key]
            content+=`<span class="dockey">${key}</span>`
            if(value.length<80) content+=` = ${value}<hr>`
            else content+=` : <hr><pre>${value}</pre><hr>`
        }
        this.x.ac("mongodocmaindiv").h(
            content
        )
        return this
    }
}