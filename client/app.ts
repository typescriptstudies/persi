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
    ajaxRequest({action:"refreshcollections"},(json:any)=>{clog(json)})
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

function buildApp(){

    let config=new Div().a([
        new Button("Test ajax").onClick(ajax),
        new Button("Get collections").onClick(getCollections),
        new Button("Refresh collections").onClick(refreshCollections),
        collectionsCombo.build(),
        new Button("Load collection").onClick(loadCollection),
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