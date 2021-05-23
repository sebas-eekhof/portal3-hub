import fs from 'fs';

function isFunc<T>(o:T):T extends (...args: any[])=>any ? true : false {
    return (!!o && {}.toString.call(o) === '[object Function]') as any;
}

function filterSerialNumber(data: string): string {
    const lines = data.split(/\r\n|\n/).filter(v=>v.indexOf("Serial")===0);
    if(lines.length<=0)
        throw "Couldn't read the Serial number. Are you sure you're running this script on a Raspberry Pi?";
    const line = lines[0];
    const matches = line.match(/^Serial\s*:\s*([0-9a-f]+)$/i);
    if(!matches || matches.length<=0)
        throw "Serial has invalid format. Are you sure you're running this script on a Raspberry Pi?";
    return matches[1].replace(/^0+/, '');
}

function getSerialNumber(callback: (error: any,data?: string)=>void): void;
async function getSerialNumber(): Promise<string>;

function getSerialNumber(callback?: (error: any,data?: string)=>void): Promise<string>|void {
    let innerCallback: (error: any, data?: string) => (Promise<string>|void);
    let returnValue: Promise<string>|undefined = undefined;

    if(callback && isFunc(callback)) {
        innerCallback = (e,d)=>{
            try {
                let a: string|undefined;
                if(typeof d === "string")
                    a = filterSerialNumber(d);
                callback(e,a);
            } catch (e) {
                callback(e);
            }
        };
        returnValue = undefined;
    } else {
        let resolve: (d: string | PromiseLike<string> | undefined)=>void;
        let reject: (e: any)=>void;
        returnValue = new Promise((res,rej)=>{
            resolve = res;
            reject  = rej;
        });
        innerCallback = (e,d) => {
            if(e)
                reject(e);
            else {
                try {
                    resolve(d===void 0 ? undefined : filterSerialNumber(d));
                } catch (e) {
                    reject(e);
                }
            }
        };
    }

    try {
        //https://raspberrypi.stackexchange.com/a/2087
        fs.readFile("/proc/cpuinfo","ascii",(err,data)=>{
            innerCallback(err,data);
        })
    } catch (e) {
        innerCallback(e);
    }

    return returnValue;
}

function getSerialNumberSync(): string {
    return filterSerialNumber(fs.readFileSync("/proc/cpuinfo","ascii"));
}

/*getSerialNumber().then(d=>console.log("Promise result: ",d)).catch(e=>console.log("Promise error: ",e));
getSerialNumber((e,d)=>{if(e) console.error("Callback error: ",e); else console.log("Callback result: ",d)});
try {
    console.log("Sync result: ",getSerialNumberSync());
} catch (e) {
    console.error("Sync error: ",e);
}*/

export {getSerialNumber, getSerialNumberSync};