DEBUG=false

let AJAX_URL=`http://${document.location.host}/ajax`

//localStorage.clear()

function resetApp(){
    localStorage.clear()
    buildApp()
}

function clog(json:any){
    conslog(JSON.stringify(json,null,2))
}

function ajaxRequest(payload:any,callback:any){
    console.log("submitting ajax request",payload)
    let body=JSON.stringify(payload) 
    let headers = new Headers()
    headers.append("Content-Type", "application/json");       
    fetch(AJAX_URL,{
        method: 'POST',
        headers: headers,
        body: body
    }).then(
        response=>{
            console.log("server responded to ajax request")
            return response.json()
        }
    ).then(
        json=>{
            console.log("server returned",json)
            callback(json)
        }
    )
}

///////////////////////////////////////////////////////////

let config:Div
let tabpane:Tabpane
let collectionsCombo=new ComboBox("collectionscombo")
let mongoColl=new MongoColl()
let collNameInput:TextInputWindow
let docTextAreaDiv=new Div()
let docTextArea:TextArea
function createDocTextArea(){
    docTextArea=new TextArea("doctext")
    docTextArea.setWidthRem(2000).setHeightRem(200)
    docTextAreaDiv.x.a([docTextArea])
}
createDocTextArea()
let updateTextAreaDiv=new Div()
let updateTextArea:TextArea
function createUpdateTextArea(){
    updateTextArea=new TextArea("updatetext")
    updateTextArea.setWidthRem(2000).setHeightRem(100)
    updateTextAreaDiv.x.a([updateTextArea])
}
createUpdateTextArea()

function ajax(){
    ajaxRequest({action:"ajax"},(json:any)=>{clog(json)})
}

function getCollections(){
    ajaxRequest({action:"getcollections"},(json:any)=>{
        clog(json)
        let collections=json.collections
        if(collections!=undefined){
            collectionsCombo.clear()
            .addOptions(Object.keys(collections).map(key=>new ComboOption(key,key)))
            .selectByIndex(0)
            .build()
        }
    })
}

function refreshCollections(){
    collectionsCombo.clear().build()
    ajaxRequest({action:"refreshcollections"},(json:any)=>{
        clog(json)
        setTimeout(getCollections,10000)
    })
}

function findMany(query:any,options:any){
    if(collectionsCombo.options.length<=0) return    
    let collname=collectionsCombo.selectedKey
    ajaxRequest({action:"getcollectionaslist",collname:collname,query:query,options:options},(json:any)=>{
        if(json.ok){
            let result=json.result
            if(result!=undefined){
                mongoColl.setDocs(result).build()
            }
        }
    })
}

function findOne(query:any,options:any){
    if(collectionsCombo.options.length<=0) return        
    let collname=collectionsCombo.selectedKey    
    ajaxRequest({action:"findone",collname:collname,query:query,options:options},(json:any)=>{
        if(json.ok){
            if(!json.error){
                mongoColl.setDocs([json.result]).build()
            }
        }
    })
}

function findOneClicked(e:Event){
    let query=getDocTextAreaJson()    
    let options=getUpdateTextAreaJson()
    findOne(query,options)
}

function loadCollection(){
    setDocTextArea("{}")
    setUpdateTextArea("{}")
    findMany({},{getall:true})
}

function createCollectionOkCallback(){
    let collname=collNameInput.textinput.getText()

    ajaxRequest({action:"createcollection",collname:collname},(json:any)=>{        
        clog(json)
        refreshCollections()
    })
}

function createCollection(){
    collNameInput=new TextInputWindow("collnameinput")
    collNameInput.setOkCallback(createCollectionOkCallback)
    .build()
}

function dropCollectionOkCallback(){
    let collname=collNameInput.textinput.getText()

    ajaxRequest({action:"dropcollection",collname:collname},(json:any)=>{        
        clog(json)
        refreshCollections()
    })
}

function dropCollection(){
    collNameInput=new TextInputWindow("collnameinput")
    collNameInput.setOkCallback(dropCollectionOkCallback)
    .build()
}

function getDocTextAreaJson(){
    try{
        let text=docTextArea.getText()
        let json=JSON.parse(text)
        return json
    }catch(err){
        return {}
    }    
}

function getUpdateTextAreaJson(){
    try{
        let text=updateTextArea.getText()
        let json=JSON.parse(text)
        return json
    }catch(err){
        return {}
    }    
}

function insertOne(){
    try{
        let json=getDocTextAreaJson()
        ajaxRequest({action:"insertone",collname:collectionsCombo.selectedKey,doc:json,options:{}},(result:any)=>{
            loadCollection()
        })
    }catch(err){
        console.log(err)
    }
}

function setDocTextArea(text:string){
    createDocTextArea()
    docTextArea.setText(text)
}

function setUpdateTextArea(text:string){
    createUpdateTextArea()
    updateTextArea.setText(text)
}

function mongoCollLoadCallback(doc:any){    
    let jsontext=JSON.stringify(doc,null,2)
    setDocTextArea(jsontext)        
    tabpane.contentdiv.e.scrollTop=0
}

function deleteSome(collname:any,filter:any,options:any){
    try{
        ajaxRequest({action:"deletesome",collname:collname,filter:filter,options:options},(result:any)=>{
            loadCollection()
        })
    }catch(err){
        console.log(err)
    }
}

function deleteOne(){
    let collname=collectionsCombo.selectedKey
    let filter=getDocTextAreaJson()    
    deleteSome(collname,filter,{kind:"one"})
}

function deleteMany(){
    let collname=collectionsCombo.selectedKey
    let filter=getDocTextAreaJson()
    deleteSome(collname,filter,{kind:"many"})
}

function updateSome(collname:any,filter:any,update:any,options:any){
    try{
        ajaxRequest({action:"updatesome",collname:collname,filter:filter,update:update,options:options},(result:any)=>{
            loadCollection()
        })
    }catch(err){
        console.log(err)
    }
}

function updateOne(){
    let collname=collectionsCombo.selectedKey
    let filter=getDocTextAreaJson()
    let update=getUpdateTextAreaJson()    
    updateSome(collname,filter,update,{kind:"one"})
}

function updateMany(){
    let collname=collectionsCombo.selectedKey
    let filter=getDocTextAreaJson()
    let update=getUpdateTextAreaJson()    
    updateSome(collname,filter,update,{kind:"many"})
}

function findManyClicked(e:Event){
    let query=getDocTextAreaJson()    
    findMany(query,{getall:true})
}

function buildApp(){
    mongoColl.setLoadCallback(mongoCollLoadCallback)

    config=new Div().a([        
        new Div().ac("controlpaneldiv").a([
            new Button("GetColls").onClick(getCollections).info,
            new Button("RefreshColls").onClick(refreshCollections).info,
            collectionsCombo.build(),
            new Button("LoadColl").onClick(loadCollection).info,
            new Button("FindOne").onClick(findOneClicked).info,
            new Button("FindMany").onClick(findManyClicked).info,
            new Button("CreateColl").onClick(createCollection).ok,        
            new Button("InsertDoc").onClick(insertOne).ok,        
            new Button("UpdateOne").onClick(updateOne).cancel,
            new Button("UpdateMany").onClick(updateMany).cancel,
            new Button("DeleteOne").onClick(deleteOne).delete,
            new Button("DeleteMany").onClick(deleteMany).delete,
            new Button("DropColl").onClick(dropCollection).delete,
        ]),
        docTextAreaDiv,
        updateTextAreaDiv,
        mongoColl.build()
    ])

    let log=new Logpane()

    tabpane=(<Tabpane>new Tabpane("maintabpane").
        setTabs([
            new Tab("config","Config",config),
            new Tab("log","Log",log)            
        ]).
        snapToWindow()).
        build()    

    log.log(new Logitem("application started","info"))

    conslog=log.logText.bind(log)

    Layers.init()

    Layers.root.a([tabpane])

}

buildApp()

DEBUG=true