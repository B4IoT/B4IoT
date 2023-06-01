<template>
    <ul>
        <template v-for="treeViewItem in props.items" :key="treeViewItem.id" :id="treeViewItem.id">
            <TreeItem v-bind:item="treeViewItem" v-bind:parent="props.parent" v-bind:list="list"
                @onCheckStatusChange="e => onCheckStatusChange(e)" :collapsed=isCollapsed(treeViewItem.id)
                @onCollapse="e => setCollapsed(treeViewItem.id, e.collapsed)">
                <template v-slot:content>
                    <slot name="item-content" v-bind:item="treeViewItem" v-bind:parent="props.parent" />
                    <span v-if="!isCollapsed(treeViewItem.id) && treeViewItem.children && treeViewItem.children.length > 0">
                        <TreeView v-bind:items="treeViewItem.children!" v-bind:parent="treeViewItem" v-bind:list="list"
                            @OnItemCheckStatusChange="e => onCheckStatusChange(e)"
                            @onContextMenu="$emit('onContextMenu', $event)">
                            <template v-for="(_, slt) in ($slots as {})" v-slot:[slt]="slotdata">
                                <slot :name="slt" v-bind="slotdata || {}" />
                            </template>
                        </TreeView>
                    </span>
                </template>
            </TreeItem>
        </template>
    </ul>
</template>
<script setup lang="ts">
import {  PropType} from "vue";

import type { TreeViewItem } from "./TreeTypes"

const props = defineProps({
    items: {
        type: Array as PropType<TreeViewItem[]>,
        required: true
    },
    list: {
        type: Object as PropType<TreeViewItem[]>,
        required: true
    },
    parent: {
        type: Object as PropType<TreeViewItem>,
        required: false,
    }
})

const emit = defineEmits(["onItemCheckStatusChange"])

const onCheckStatusChange = (e: { item: TreeViewItem, checked: Boolean }) => {
    emit("onItemCheckStatusChange", { item: e.item, checked: e.checked })
}

function isCollapsed(id: string): boolean {
    const i = props.items.find(i=>i.id ==id)
    if (i==undefined) throw "feature not found"
    return i!.collapsed
}
function setCollapsed(id: string, val: boolean) {
    const i = props.items.find(i=>i.id ==id)
    if (i==undefined) throw "feature not found"
    i.collapsed = val
}

</script>
<style src="./style.scss"></style>