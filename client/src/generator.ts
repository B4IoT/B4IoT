import { Feature } from "./types/Feature";
import { getProperty, format, MapType } from "./Utils";

const DEBUG=false
const privateRepo = `RUN apk add --no-cache openssh
RUN mkdir -p ~/.ssh
ADD id_rsa /root/.ssh/id_rsa
RUN echo '[url "git@github.com:"]\
insteadOf = https://github.com/' >> ~/.gitconfig
RUN echo "Host github\
   Hostname github.com\
   IdentityFile ~/.ssh/id_rsa\
   IdentitiesOnly yes" >> /etc/ssh/ssh_config
RUN echo "github.com ssh-ed25519 ..." >> ~/.ssh/known_hosts`

const dockerTemplate = `FROM {baseImage}:{version}
LABEL maintainer='imec-DistriNet'
#TO RUN AND CONNECT TO THE IMAGE RUN THE FOLLOWING COMMANDS:

#open a terminal in the same directory as the downloaded Dockerfile
#docker build -t dvd:<"name"> . 
#map the port being exposed at the bottom of this scripts to any ports of your choosing
#docker run --name <"name"> --rm -d  -p <portHOST>:<portEXPOSED> dvd:<"name">

#Use this name to connect to the running instance of the image:
#docker exec -it <"name"> bash


#If you are interested in static firmware analysis, it is possible to extract the filesystem from the image
#using the following command:
#docker export <"name"> -o <name>.tar.gz



RUN apk update && apk add --no-cache bash git
{private}

RUN git clone {branch} {repo} /tmp/backend

RUN \
{run}

RUN rm -rf /tmp/*
RUN sed -i 's/^tty/#tty/' /etc/inittab 

{ports}

ENTRYPOINT ["/sbin/init"]`


const r = new RegExp(/\{([a-z_]*:[a-z_]+)\}/g)
export namespace generator {
 
    function addToContext(ctx: MapType<string>, f:Feature):MapType<string>{
       
        let props = f.getDisplayProperties()
        
         Object.keys(props).forEach(key => {
            ctx[`${f.feature}:${key}`]=props[key].toString()
        })
        return ctx
    }
    function formatInstaller(s:string, ctx: MapType<string>){
        for (const m of s.matchAll(r)) {
            s = s.replaceAll(`${m[0]}`, getProperty(ctx,m[1], "/*undefined*/"))
        }
        return s
    }
    export function generate(config: any, architecture: string, features: Feature[]): string {
        const pl = features.find(f=>f.feature=="platform")
        if (pl==undefined) throw "platform not found"
        const baseImage = pl.getProperty("baseImage", "alpine") as string
        const version = pl.getProperty("version", "latest") as string
        const featuresPath = config.featurePath ? config.featurePath : "Features"
        // const branch = config.branch? `-b ${config.branch}`:""
        const priv = DEBUG?privateRepo:""
        let ports: string[] = []
        let context: MapType<string>=addToContext({},pl)
        const scripts = features.map(f => {
            context = addToContext(context,f)
            if (f.scripts){                
                const script = f.scripts.path==""?f.scripts.install: `/tmp/backend/${featuresPath}/${formatInstaller(f.scripts.install, context)}`
                ports = ports.concat(f.getPropertyArray("port"))
                return `chmod +x ${script} \\\n  && .${script}`
            }
        }).filter(f=>f!=undefined)

        //const runs = scripts.join(" \\\n  && ")
        const runs = scripts.join(" \n RUN ")
        ports = ports.filter((item, index) =>ports.indexOf(item)===index)
        const exposed = ports.map(p=>`EXPOSE ${p}` ).join("\n")
        return format(dockerTemplate, { baseImage:baseImage, version:version, branch:'', private:priv, repo: config.location, envs: `ENV FEATURES=/tmp/backend/${featuresPath}`, run: runs, ports: exposed})
    }
}
