export type MapType<Type> = {
  [id:string]:Type;
}

export function trim(s: string, del: string){
  if (s==undefined) return s
  if (s.substring(0,del.length) == del)
    s = s.substring(del.length)
    if (s.substring(s.length-del.length) == del)
    s = s.substring(0, s.length-del.length)
    return s
}

export function stringify(s:string|string[]|undefined): string{
  if (s == undefined) return ""
  if (s as string){
    return s as string
  } else return (s as string[]).join(", ")
}

export function mapToObject<T1,T2>(m:Map<T1,T2>){
  let o :any = {}
  m.forEach((v,k)=> o[k] = v)
  return o
}
export function format(str: string, map: MapType<string>) {
  const keys = Object.keys(map)
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index]
    str = str.replace(`{${key}}`, map[key]!.toString());
  }
  return str;
}

export function capitalize(s: string) {
  return `${s[0].toUpperCase()}${s.substring(1)}`
}
export function hasProperty(map: any, name: string) { 
  return map == undefined ? false : Object.keys(map).some(k => k == name) 
}
export function getProperty<T>(map: any, name: string, default_value:T|undefined =undefined) { 
  return hasProperty(map, name) ? map[name] : default_value 
}
export function flattenToString(o: object) {
  return Object.keys(o).map(k => `${k}: ${getProperty(o, k)}`).join(", ")
}



function readFile(evt:any, cb:(data:string|undefined)=>void) {
  var files = evt.target.files;
  var file = files[0];
  var reader = new FileReader();
  reader.onload = function (event) {
    if (event.target?.result)
      cb(event.target!.result!.toString())
    else
      cb(undefined)
  }
  reader.readAsText(file)
}