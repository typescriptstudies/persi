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

let collectionsCombo=new ComboBox("collectionscombo")
let mongoColl=new MongoColl()
let collNameInput:TextInputWindow
let docTextAreaDiv=new Div()
let docTextArea:TextArea
function createDocTextArea(){
    docTextArea=new TextArea("doctext")
    docTextArea.setWidthRem(800).setHeightRem(200)
    docTextAreaDiv.x.a([docTextArea])
}
createDocTextArea()

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

function loadCollection(){
    if(collectionsCombo.options.length<=0) return    
    let collname=collectionsCombo.selectedKey
    ajaxRequest({action:"getcollectionaslist",query:{},collname:collname},(json:any)=>{
        if(json.ok){
            let result=json.result
            if(result!=undefined){
                mongoColl.setDocs(result).build()
            }
        }
    })
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

function insertOne(){
    try{
        let text=docTextArea.getText()
        let json=JSON.parse(text)
        ajaxRequest({action:"insertone",collname:collectionsCombo.selectedKey,doc:json,options:{}},(result:any)=>{
            loadCollection()
        })
    }catch(err){
        console.log(err)
    }
}

function mongoCollLoadCallback(doc:any){    
    let jsontext=JSON.stringify(doc,null,2)
    createDocTextArea()
    docTextArea.setText(jsontext)
}

function buildApp(){
    mongoColl.setLoadCallback(mongoCollLoadCallback)

    let config=new Div().a([
        new Button("Test ajax").onClick(ajax),
        new Button("Get collections").onClick(getCollections),
        new Button("Refresh collections").onClick(refreshCollections),
        collectionsCombo.build(),
        new Button("Load collection").onClick(loadCollection),
        new Button("Create collection").onClick(createCollection),
        new Button("Drop collection").onClick(dropCollection),
        new Button("Insert one").onClick(insertOne),
        docTextAreaDiv,
        mongoColl.build()
    ])

    let log=new Logpane()

    let tabpane=(<Tabpane>new Tabpane("maintabpane").
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