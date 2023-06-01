<template>
    <div class="row">
        <h2>Features for {{ arch }}</h2>
        <div class="row align-items-start">
            <div class="col">
                <label>Group By:</label>
                <MultiSelect v-model="group" mode="tags" :close-on-select="true" :searchable="true" :options="groupings">
                </MultiSelect>
            </div>
            <div class="col">
                <label>Filter</label>
                <div class="input-group rounded">
                    <input type="search" class="form-control rounded" v-model="filter" placeholder="Filter"
                        aria-label="Filter" aria-describedby="search-addon" />
                    <span class="input-group-text border-0" id="search-addon">
                        <i-fa-search />
                    </span>
                    <span style="margin:12px;width:1em">

                        <i-bi-info-square id="filter_info" />
                        <b-popover target="filter_info" triggers="hover" placement="top">
                            <template #title>Filter:</template>
                            <div>
                                Filtering is by default applied to all properties shown for each feature.
                                It is possible to limit filtering to a specific field by specifying the field as
                                follows:
                                <code>property=value</code>

                                The fields currently available are:
                                {{ Object.keys(groupings).join(", ") }}
                                Negation of the filter is possible using a dash (-).
                            </div>
                        </b-popover>
                    </span>
                </div>

            </div>
        </div>
    </div>
    <div id="result" class="row container">
        <div class="tree container">
            <i-bi-journal-album style="color:black" /><br />
            <TreeView ref="tree" :list=featurelist v-bind:items="features"
                @onItemCheckStatusChange="e => onItemCheckStatusChange(e)">
                <template v-slot:item-content="{ item: treeViewItem }">
                    <template v-if="treeViewItem.feature != 'folder'">
                        <details>
                            <summary @mouseover="hover = `pop${treeViewItem.id}`" @mouseleave="hover = undefined">{{
                                treeViewItem.data ? treeViewItem.data!.display_name : treeViewItem.name }} <span
                                    v-if="treeViewItem.validation_info != undefined">
                                    <i-bi-exclamation-diamond :id="`pop${treeViewItem.id}`"
                                        :class="validationClass(treeViewItem)" />
                                    <b-popover :show.sync="hover == `pop${treeViewItem.id}`"
                                        :target="`pop${treeViewItem.id}`" triggers="hover" placement="top">
                                        <template #title>{{ treeViewItem.validation_info.type == 'conflict' ?
                                            "Conflict detected: " : treeViewItem.validation_info.type ==
                                                'missing-dependency' ?
                                                "Missing Dependency Found:" : "Missing Dependency and Conflicts:" }}</template>
                                        {{ treeViewItem.validation_info.info }}
                                    </b-popover>
                                </span>
                            </summary>
                            <dl class="row border rounded">
                                <dt class="col-sm-3">Description:</dt>
                                <dd class="col-sm-9">
                                    {{ (treeViewItem.data as Feature).description }}
                                </dd>
                                <dt class="col-sm-3" v-if="(treeViewItem.data as Feature).hasDependencies()">
                                    Dependencies:
                                </dt>
                                <dd class="col-sm-9" v-if="(treeViewItem.data as Feature).hasDependencies()">
                                    {{ (treeViewItem.data! as Feature).dependencies!.map(d => flattenToString(d)).join("; ")
                                    }}
                                </dd>
                                <dt class="col-sm-3" v-if="(treeViewItem.data as Feature).hasVulnerabilities()">
                                    Vulnerabilities:</dt>
                                <dd class="col-sm-9" v-if="(treeViewItem.data as Feature).hasVulnerabilities()">
                                    {{ (treeViewItem.data as Feature).vulnerabilities.join(", ") }}
                                </dd>
                                <template v-for="p of (treeViewItem.data as Feature).getExtendedProperties()">
                                    <dt class="col-sm-3">
                                        {{ capitalize(p[0]) }}
                                    </dt>
                                    <dd class="col-sm-9">
                                        {{ p.join(', ').split(", ")[1] }}
                                    </dd>
                                </template>

                            </dl>
                        </details>
                    </template>
                </template>
            </TreeView>
        </div>
        <div class="container row">
            <div class="col selection">
                <label>Selected Features:</label>
                <div class="container row">
                    <ul><template v-for="f in featurelist">
                            <li v-if="f.checkedStatus == 'true'">{{ `${f.feature}:
                                                            '${f.name}'` }}</li>
                        </template>
                    </ul>
                </div>
            </div>
        </div>
        <b-button @click="generate()" :disabled="hasErrors">Generate Docker File</b-button>
        <div>
            <!-- Modal -->
            <div v-if='dockerString != ""' class="modal fade show" id="docker" tabindex="-1" aria-modal="true" role="dialog"
                style="display:block">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">B4IoT Docker File
                            <button type="button" @click="close()" class="btn-close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-floating">
                                <textarea v-if="dockerString != ''" style="height:250px" :value="dockerString"
                                    class="form-control"></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <b-button @click="download(dockerString, 'Dockerfile')" :disabled="hasErrors">Download Docker
                                File</b-button>
                            <b-button @click="download(listing(), 'B4IoT.csv')" :disabled="hasErrors">Download selected
                                features (csv)</b-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import MultiSelect from '@vueform/multiselect'
import { onMounted, watch, ref, computed} from 'vue'
import { flattenToString, capitalize, stringify } from '../Utils'
import TreeView from "../components/tree-view/TreeView.vue"
import { Feature, TreeViewFeature, renderFeatures, loadFeatures } from "../types/Feature"
import { generator } from "../generator"
import { TreeViewItem, ValidationInfo } from '../components/tree-view/TreeTypes'
import { MapType } from '../Utils'

import { useStore } from 'vuex';

const store = useStore() as any

// properties
const props = defineProps({
    arch: { type: String, required: true }
})

// elements
const hover = ref()
const tree = ref<HTMLElement>()

// local properrrties
const group = ref(['feature'])
const filter = ref("")
const featurelist = ref<TreeViewItem[]>([])
const features = ref<TreeViewFeature[]>([])
const hasErrors = computed(() => featurelist.value?.some(f => f.validation_info != undefined))
const dockerString = ref("")
const groupings = ref<MapType<string>>({ /*"tree": "Feature Tree",*/ "feature": "Feature Type" })



// interaction
onMounted(() => {
    let atts: string[] = []
    let fs = loadFeatures(store.state.config.features, props.arch)
    fs.forEach(f => {
        //enable prefiltered
        if (f.data!.feature == "platform") {
            f.checkedStatus = f.data?.name == props.arch ? "true" : "false"
            f.fixed = true
        }
        if (f.data!.hasDependencies()) {
            f.data!.dependencies!.forEach(filter => {
                const x = fs.filter(dd => dd.data!.matches(filter));
                if (x) f.dependencies.push({ "name": flattenToString(filter), "list": x })
            })
        }
        if (!f.fixed)
            atts = atts.concat(f.data?.getDisplayPropertyNames() as string[])
    })
    new Set(atts.sort((a, b) => a.localeCompare(b))).forEach(a => groupings.value[a] = a=="feature"?"Feature Type" :capitalize(a))
    featurelist.value = fs
    features.value = renderFeatures(featurelist.value, group.value, filter.value)
})

watch(() => [group.value, filter.value],
    () => {
        // if group.value or filter.value changes
        features.value = []
        if (featurelist.value)
            features.value = renderFeatures(featurelist.value, group.value, filter.value)
    })


const onItemCheckStatusChange = (e: { item: TreeViewFeature, checked: Boolean }) => {
    //
    featurelist.value!.forEach(f => f.validation_info = undefined)
    let selection = featurelist.value!.filter(f => f.checkedStatus == "true")
    //validate
    for (let i = 0; i < selection!.length; i++) {
        let info: ValidationInfo[] = []
        let f1 = selection![i]
        const ff1: Feature = f1.data!
        //check all dependencies
        f1.dependencies.forEach(d => {
            if (d.list.every(dd => dd.checkedStatus == "false")) {
                info.push({ info: `${d.name} is required, please select`, type: "missing-dependency" })
            }
        })
        //check all conflicts
        if (f1.fixed) continue
        const as1 = Object.keys(f1.data! as Feature)
        for (let j = 0; j < selection!.length; ++j) {
            if (j == i) continue
            const f2 = selection![j]
            if (f2.fixed) continue
            let ff2: Feature = selection![j].data!

            const ps1 = ff1.getPropertyArray("port")
            const ps2 = ff2.getPropertyArray("port")
            ps1.forEach(p1=>
                ps2.forEach(p2=> {
                    if (p1 == p2) info.push(f1.validation_info = { info: `Both ${ff1.name} and ${ff2.name} are on the same port ${p1}. Please update `, type: "conflict" })
                })
            )
            const services1 = ff1.getPropertyArray("service")
            const services2 = ff2.getPropertyArray("service")
            services1.forEach(s1=>{
                services2.forEach(s2=>
                {
                    
                    if (s1 == s2)
                        info.push({ info: `Both ${ff1.name} and ${ff2.name} provide the same service. (${s1}). Please disable one of them`, type: "conflict" })
                }
                )
            })

        }
        if (info.length > 0)
            f1.validation_info = { info: info.map(m => m.info).join("; "), type: info.some(x => x.type == "conflict") && info.some(x => x.type == "missing-dependency") ? "multi" : info[0].type }
    }
}

const validationClass = (i: TreeViewFeature) => {
    if (i.validation_info != undefined) {
        return String(i.validation_info?.type)
    } return ""
}

function sortFeatures(fs: TreeViewFeature[]) {
    let r: TreeViewFeature[] = []
    let changed = true
    while (!changed || fs.length > 0) {
        changed = false
        for (let f of fs) {
            let d = f.dependencies.map(d => d.list.filter(dd => dd.checkedStatus == "true"))
            //if all checked dependencies are in the result, add it to the result
            if (d.every(x => x.every(y => r.find(x => x.id == y.id)))) {
                r.push(f)
                fs = fs.filter(x => x.id != f.id)
                changed = true
                break;
            }
        }
        if (!changed) { throw "Failure" }
    }
    return r
}

function generate() {
    dockerString.value = generator.generate(store.state.config, props.arch, sortFeatures(
        featurelist.value.filter(f => f.checkedStatus == "true"))
        .map(f => f.data!))

}

function download(text: string, filename: string) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
function listing() {
    const fields = ["feature", "name", "vulnerabilities", "CWEs", "location"]
    const fs = sortFeatures(featurelist.value!.filter(f => f.checkedStatus == "true"))
    return fields.join("; ") + "\n" + fs.map(f => {
        return fields.map(fld => {
            let val = f.data!.getProperty(fld, "")
            if (Array.isArray(val))
                val = (val as string[]).map(v => v.toString()).join(", ")
            return `"${val}"`
        }).join("; ")
    }).join("\n")

}
function close() {
    dockerString.value = ""
}


</script>

<style src="@vueform/multiselect/themes/default.css"></style>
<style scoped lang="scss">
.selection {
    margin-top: 20px;
    background-color: white;

    li {
        font-size: small
    }
}

.missing-dependency {
    color: orange;
}

.conflict {
    color: orangered;
}

.multi {
    color: red;

}

#docker {
    --bs-modal-width: 800px;
}
</style>