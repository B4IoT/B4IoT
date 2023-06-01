<template>
    <li>
        <div class="row">
            <div class="col-auto" style="margin-right:0px;padding-right:0px">
                <input class="align-top form-check-input" @contextmenu.prevent @change="updateCheckState" type="checkbox"
                    ref="checkbox" :indeterminate='item.checkedStatus == "some"'
                    :checked="item.checkedStatus == 'true'"                    
                    id="cb" />
            </div>
            <div class="col" style="padding-left:0px">

                <template v-if="item.feature == 'folder'">
                    <div class="col" v-on:click="toggleCollapse()">
                        <i-fa-folder v-if="collapsed" />
                        <i-fa-folder-open v-else />
                        <label for="checkbox">{{ item.name }}</label><br />
                    </div>
                    <slot name="content"></slot>
                </template>
                <div v-else>
                    <slot name="content"></slot>
                </div>
            </div>
        </div>
    </li>
</template>

<script setup lang="ts" >

import { PropType, ref, watch, onMounted } from "vue";
import type { TreeViewItem } from "./TreeTypes"

const props = defineProps({
    item: {
        type: Object as PropType<TreeViewItem>,
        required: true
    },
    list: {
        type: Object as PropType<TreeViewItem[]>,
        required:true
    },
    parent: {
        type: Object as PropType<TreeViewItem>
    },
    collapsed: {
        type: Boolean,
        required: true
    },
})


const emit = defineEmits(["onCollapse", "onCheckStatusChange"])
const isLoading=ref(true)
const checkbox = ref<HTMLInputElement>()

onMounted(()=>{
    isLoading.value = false
    checkbox.value!.checked=props.item.checkedStatus=="true"
}
)


watch(() => props.item.checkedStatus,
    () => {
    if (!isLoading.value){
        if ((props.item.checkedStatus == "true" || props.item.checkedStatus == "false") && props.item.children) props.item.children.forEach(i => {
            i.checkedStatus = props.item.checkedStatus
        })
        if (props.parent && !props.parent.fixed) {
            let c = props.parent.children

            if (c?.every(it => it.checkedStatus == "true"))
                //if all children checked: set checked
                props.parent.checkedStatus = "true"
            else if (c?.every(it => it.checkedStatus == "false"))
                //if all children not checked: set not checked
                props.parent.checkedStatus = "false"
            else //if some children checked: set partial
                props.parent.checkedStatus = "some"
        }
        if (props.item.checkedStatus=="true") {
            //if all dependent items are uncheked: change true:disabled into true
            checkSingleDependency(props.item, props.list)
        }
        emit("onCheckStatusChange", { item: props.item, checked: checkbox.value?.checked })
    }
    })

function isSingleDependency(fs: TreeViewItem[], list: TreeViewItem[]):Boolean{
    if (fs.length == 0) return true
    return fs.length==1 //&& fs.every(f=>  f.dependencies.every(d=> isSingleDependency(d.list, list)))
}
function checkSingleDependency(ft: TreeViewItem, list: TreeViewItem[]) {
    if (ft.dependencies.length == 0) return true
    ft.dependencies.forEach(d => {
        // for each dependency: if there is only one option, check them all
        if (isSingleDependency(d.list,list) && d.list[0].checkedStatus == "false" ){
            d.list[0].checkedStatus = "true"
            checkSingleDependency(d.list[0],list)    
        }
            
        
    }
    )
}

const updateCheckState = () => {
    props.item.checkedStatus = checkbox.value?.checked ? "true" : "false"
    // //if all dependencies determined: check them

}

function toggleCollapse() {
    emit("onCollapse", { collapsed: !props.collapsed })
}
</script>
<style scoped>
input {
    margin-top: 4px;
    margin-right: 5px;
}
</style>