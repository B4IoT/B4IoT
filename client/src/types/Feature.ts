import { getProperty, MapType, stringify, trim } from "../Utils";
import { CheckedState, TreeViewItem, ValidationInfo } from "../components/tree-view/TreeTypes";



const match = (o: Object, filter: Object): Boolean => {
    const props = Object.keys(filter)
    return props.every(p => {
        const prop = getProperty(o, p)
        const prop_filter = getProperty(filter, p)
        if (prop == undefined)
            return false;
        else if (typeof prop_filter == "string") {
            return new RegExp(`^${prop_filter}$`).test(prop)
        } else {
            if (!match(prop, prop_filter))
                return false
        }
        return false
    })
}

type PartialWithRequired<T, K extends keyof T> = Pick<T, K> & Partial<T>;

export class Feature {
    feature: string
    name: string
    description: string
    display_name: string
    dependencies: object[]
    private properties: Map<string, string | string[]>
    vulnerabilities: string[]
    scripts?: {
        install: string
        build?: string
        path: string
    }
    static basePropertyNames = ['feature', 'name', 'display_name', 'description', 'dependencies', 'scripts', 'vulnerabilities']
    public constructor(init: PartialWithRequired<Feature, 'feature' | 'name' | 'description'>) {
        this.feature = init.feature
        this.name = init.name
        this.description = init.description
        this.display_name = getProperty(init, "display_name", init.name)
        this.dependencies = getProperty<object[]>(init, "dependencies", [])
        this.vulnerabilities = getProperty<string[]>(init, 'vulnerabilities', [])
        let scripts = getProperty(init, "scripts")
        if (scripts) {
            scripts.path = trim(scripts.path, "/")
            if (scripts.path == undefined) scripts.path = this.name
            this.scripts = scripts
        }
        this.properties = new Map(Object.keys(init).filter(k => !Feature.basePropertyNames.includes(k)).map(k => [k, (init as any)[k] as string | string[]]))
    }
    //only properties in the list of basePropertyNames
    private getBaseProperty(n: string): string | string[] | undefined {
        return (this as any)[n]
    }
    private isBaseProperty(n: string) {
        return Feature.basePropertyNames.includes(n)
    }

    hasProperty(name: string): Boolean {
        return this.isBaseProperty(name) || this.properties.has(name)
    }
    getNullableProperty(name: string): string | string[] | undefined {
        if (this.isBaseProperty(name)) return this.getBaseProperty(name)
        if (this.hasProperty(name)) return this.properties.get(name)!
        return undefined
    }
    getProperty(name: string, default_value: string | string[]): string | string[] {
        const p = this.getNullableProperty(name)
        return p ? p : default_value
    }
    getPropertyArray(name: string): string[] {
        const p = this.getNullableProperty(name)
        if (p == undefined) return []
        return Array.isArray(p) ? p : [p]
    }
    //all properties that may be shown in gui
    getDisplayPropertyNames(): string[] {
        return Feature.basePropertyNames.filter(p => p != "scripts").concat(Array.from(this.properties.keys()))
    }
    getDisplayProperties() {
        let o: MapType<string | string[]> = {}
        for (const p of this.getDisplayPropertyNames()) {
            o[p] = this.getProperty(p, "")
        }
        return o
    }
    getExtendedProperties() {
        return this.properties
    }
    hasExtendedProperties(): Boolean {
        return this.properties.size > 0
    }
    hasDependencies(): Boolean {
        return this.dependencies.length > 0
    }
    hasVulnerabilities(): Boolean {
        return this.vulnerabilities.length > 0
    }
    matches(filter: Object): Boolean {
        return match(this.getDisplayProperties(), filter)

    }

}
export class TreeViewFeature implements TreeViewItem {
    children!: TreeViewFeature[];
    feature!: string;
    checkedStatus!: CheckedState;
    collapsed: boolean = false
    fixed: boolean = false
    name!: string;
    data?: Feature;
    id!: string;
    dependencies!: { name: string, list: TreeViewFeature[] }[]
    validation_info?: ValidationInfo | undefined;
    
    public constructor()
    
    public constructor(init: TreeViewFeature)
    public constructor(init?: TreeViewFeature){
        if(init){
            this.children = init!.children
            this.feature = init!.feature
            this.checkedStatus = init!.checkedStatus
            this.fixed = init!.fixed
            this.name = init!.name
            this.data = init!.data
            this.id = init!.id
            this.dependencies = init!.dependencies
            this.validation_info = init!.validation_info
        }
        else {
            this.children = []
            this.feature = ""
            this.checkedStatus = "false"
            this.fixed = false
            this.name = ""
            this.id = ""
            this.dependencies = []

        }

    }

}
const clean_id = (id: string) => id.replaceAll(" ", "_").toLowerCase()

const NoName = "<None>"
function groupBy(list: TreeViewFeature[], keyGetter: (_: TreeViewFeature) => string[]) {
    const m: TreeViewFeature[] = []
    list.forEach((item) => {
        if (item.data) {
            let props = keyGetter(item);
            if (props.length == 0)
                props.push(NoName)
            props.forEach(p => {
                let x = m.find(i => i.id == p)
                if (x == undefined) {
                    let it: TreeViewFeature = { name: p, id: p, feature: "folder", fixed: false, checkedStatus: "false", children: [item], dependencies: [], collapsed: p == NoName }
                    m.push(it)
                } else {
                    x.children!.push(item)
                }
            })
        }
    });
    m.forEach(item => {
        if (item.children.length > 0) {
            if (item.children.every(c => c.checkedStatus == "true"))
                item.checkedStatus = "true"
            else if (item.children.some(c => c.checkedStatus == "true"))
                item.checkedStatus = "some"
        }
    })
    return m;
}


function getGBProperty(f: TreeViewFeature, propertyName: string): string[] {
    if (propertyName == "dependencies")
        return f.dependencies.map(m=>m.name)
    return f.data!.getPropertyArray(propertyName)
}

function isValidNode(ft: Feature, orig: Feature[]) {
    if (ft.dependencies.length == 0) return true
    if (ft.dependencies.every(d => {
        const l = orig.filter(f => f.matches(d))
        if (l.length > 0 && l.some(n => isValidNode(n, orig)))
            return true
        else {
            return false
        }
    }
    ))
        return true
    else
        return false
}

function prune(lst: Feature[]) {
    let result: Feature[] = []
    lst.forEach(l => {
        if (isValidNode(l, lst)) {
            result.push(l)
        }
    })
    return result
}
export function loadFeatures(lst: any[], arch: string): TreeViewFeature[] {
    let fs = lst.map(m => new Feature(m))
    fs = fs.filter(f => f.feature != "platform" || f.name == arch) //either no platform object, or it is from the right architecture
    //remove features that have no satisfiable dependencies (e.g., depend on other architecture)
    fs = prune(fs)
    return fs.map<TreeViewFeature>(f => {
        return {
            name: f.name,
            children: [],
            id: clean_id(f.name),
            feature: f.feature,
            fixed: f.feature == "platform",
            checkedStatus: "false",
            data: f,
            dependencies: [],
            collapsed: false
        }
    })
}



function applyEmptyGrouping(items: TreeViewFeature[]){
    const folder: Map<string, TreeViewFeature> = new Map<string, TreeViewFeature>()
    
    const lst = items.map(item =>{
        return  {key: item.data!.scripts!.install.split("/").slice(0, -1).toLocaleString().replaceAll(",","/"), value: item}
    }).sort((a, b) => a.key.localeCompare(b.key))
    
    lst.forEach(item => {
        if(!folder.has(item.key)){
            if(!folder.has(item.key.split("/")[0])){
                folder.set(item.key.split("/")[0], new TreeViewFeature() )
                folder.get(item.key.split("/")[0])!.id = item.key.split("/")[0]
                folder.get(item.key.split("/")[0])!.name = item.key.split("/")[0]
                folder.get(item.key.split("/")[0])!.feature = "folder" 
                delete folder.get(item.key.split("/")[0])!.data
                
            }
            if(!folder.has(item.key.split("/")[0] + "/"+ item.key.split("/")[1]) ){
                folder.set(item.key.split("/")[0] + "/"+ item.key.split("/")[1], new TreeViewFeature())
                folder.get(item.key.split("/")[0] + "/"+ item.key.split("/")[1])!.id = item.key.split("/")[0] + "/"+ item.key.split("/")[1] 
                folder.get(item.key.split("/")[0] + "/"+ item.key.split("/")[1])!.name = item.key.split("/")[1]
                folder.get(item.key.split("/")[0] + "/"+ item.key.split("/")[1])!.feature = "folder" 
                delete folder.get(item.key.split("/")[0] + "/"+item.key.split("/")[1])!.data
                if(item.key.split("/")[2] == undefined ){
                    folder.get(item.key.split("/")[0] + "/"+ item.key.split("/")[1])?.children.push(item.value)
                }
                folder.get(item.key.split("/")[0])?.children.push(folder.get(item.key.split("/")[0] + "/"+item.key.split("/")[1])!)
               
            }

            if(item.key.split("/")[2] != undefined && !folder.has(item.key.split("/")[0] + "/"+ item.key.split("/")[1]+ "/"+ item.key.split("/")[2])){
                folder.set(item.key.split("/")[0] + "/"+ item.key.split("/")[1]+ "/"+ item.key.split("/")[2], new TreeViewFeature())
                folder.get(item.key.split("/")[0] + "/"+ item.key.split("/")[1]+ "/"+ item.key.split("/")[2])!.id = item.key.split("/")[0] + "/" + item.key.split("/")[1]+ "/"+ item.key.split("/")[2]
                folder.get(item.key.split("/")[0] + "/"+ item.key.split("/")[1]+ "/"+ item.key.split("/")[2])!.name = item.key.split("/")[2]
                folder.get(item.key.split("/")[0] + "/"+ item.key.split("/")[1]+ "/"+ item.key.split("/")[2])!.feature = "folder" 
                delete folder.get(item.key.split("/")[0] + "/"+ item.key.split("/")[1]+ "/"+ item.key.split("/")[2])!.data
                folder.get(item.key.split("/")[0] + "/"+ item.key.split("/")[1]+ "/"+ item.key.split("/")[2])?.children.push(item.value)
                folder.get(item.key.split("/")[0] + "/"+item.key.split("/")[1])?.children.push(folder.get(item.key.split("/")[0] + "/"+ item.key.split("/")[1]+ "/"+ item.key.split("/")[2])!)
            }

        }

        
    })



    //potentially cull one the twins 
    folder.forEach(it =>{
        it.children = it.children.filter(function(i, p) {
            return it.children.indexOf(i) ==p
        })
    })

    const finalFolder: TreeViewFeature[] = []
    //check if it has the folder b4 adding it to the final folder
    if(folder.has("misconfigurations"))
        finalFolder.push(folder.get("misconfigurations")!)
    if(folder.has("resources"))
        finalFolder.push(folder.get("resources")!)
    if(folder.has("vulnerabilities"))
    finalFolder.push(folder.get("vulnerabilities")!)


    return finalFolder
}

function applyGrouping(items: TreeViewFeature[], groups: string[]) {
    if (groups.length == 0){
        var g = applyEmptyGrouping(items) 
        return g
    } 
    

    var g = groupBy(items, f => getGBProperty(f, groups[0]))
    var grp = Array.from(groups).slice(1)
    if (grp.length > 0)
        g.forEach(it => {
            if (it.children)
                it.children = applyGrouping(it.children, grp)
        })

    return g.sort((a, b) => {
        return String(a.name).localeCompare(b.name)
    })
}

export function renderFeatures(featurelist: TreeViewFeature[], groups: Array<string>, filter: string): TreeViewFeature[] {
    // split filter on | => or
    // split filter on spaces => and
    // if starts with '-' then negate
    // if contains '=' split and take field otherwise use all display fields

    
    const lst: TreeViewFeature[] = []
    const or = filter.trim().toLowerCase().split("|")
    featurelist.forEach(f => f.children = [])
    const fs = featurelist.filter(ftr => !ftr.fixed)
        .filter(ftr =>
            or.some(f => {
                if (f == "") return true
                const and = f.trim().split(" ")
                return and.every(a => {
                    let spl = a.split("=")
                    if (spl.length > 1) {
                        const p = ftr.data!.getDisplayProperties()[spl[0]]
                        if (p != undefined) {
                            //if found in one of the properties
                            if (spl[1][0] == '-')
                                return !stringify(p).includes(spl[1].substring(1))
                            else
                                return stringify(p).includes(spl[1])
                        }
                    } else {
                        const ps = ftr.data!.getDisplayProperties()
                        if (a[0] == '-') //ngeation: not a single match
                            return Object.keys(ps).every(k => !ps[k].includes(a.substring(1)))
                        else // at least one match
                            return Object.keys(ps).some(k => ps[k].includes(a))
                    }

                    return false
                })
            })
        )

    const g = applyGrouping(fs, groups)
    return g
}