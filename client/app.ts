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
    let body=JSON.stringify(payload) 
    let headers = new Headers()
    headers.append("Content-Type", "application/json");       
    fetch(AJAX_URL,{
        method: 'POST',
        headers: headers,
        body: body
    }).then(
        response=>response.json()
    ).then(
        json=>callback(json)
    )
}

function ajax(){
    ajaxRequest({action:"ajax"},(json:any)=>{clog(json)})
}

function getCollections(){
    ajaxRequest({action:"getcollections"},(json:any)=>{clog(json)})
}

function refreshCollections(){
    ajaxRequest({action:"refreshcollections"},(json:any)=>{clog(json)})
}

function buildApp(){

    let config=new Div().a([
        new Button("Test ajax").onClick(ajax),
        new Button("Get collections").onClick(getCollections),
        new Button("Refresh collections").onClick(refreshCollections)
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