module.exports =  class Client{
    constructor(){
        this.Clientlist = new Map();
        this.Connlist = new Map();
    }
    setClient(key, remoteAddress, friendlyName, RSApublicKey, connection){
        this.Clientlist.set(key, {
            ip: remoteAddress,
            name: friendlyName,
            publicKey: RSApublicKey
        });
        this.Connlist.set(key, connection);
    }
    removeClient(key){
        let name = this.Clientlist.get(key).name;
        this.Clientlist.delete(key);
        this.Connlist.delete(key);
        return name;
    }
    updateClient(key, jsonObj){
        if(jsonObj.name)
            this.Clientlist.get(key).name = jsonObj.name;
        
        if(jsonObj.publicKey)
            this.Clientlist.get(key).publicKey = jsonObj.publicKey;
        return this.Clientlist.get(key).name + " Online | Total Connection : " + this.getSize();
    }
    getSize(){
        return this.Clientlist.size;
    }
    notifyAll(initatior) {
        for(const [key, value] of this.Connlist.entries()) {
            if(key != initatior)
                value.send(JSON.stringify(Object.fromEntries(this.Clientlist)));
        }
    }
    sync(initatior, jsonObj){
        process.stdout.write("\n"+this.Clientlist.get(initatior).name +
                             " Copied:\n------------------------------\n"
                             +Buffer.from(jsonObj.data, 'base64').toString()
                             +"\n------------------------------\n")
        if(this.Connlist.size() > 1)
            process.stdout.write("sharing data with")
        else
            console.log("But, no decive is connected to recieve data")
        for(const [key, value] of this.Connlist.entries()) {
            if(key != initatior){
                if(jsonObj.encrypted)
                    value.send(JSON.stringify({from:initatior,data:jsonObj[key],type:jsonObj.type, encrypted:true}));
                else
                    value.send(JSON.stringify({from:initatior,data: jsonObj.data,type:jsonObj.type,encrypted:false}));
                    process.stdout.write(" " + this.Clientlist.get(key).name)
            }
        }
    }
}