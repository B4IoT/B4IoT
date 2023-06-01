<script setup lang="ts">
import { computed, ref } from 'vue'

import { useStore } from 'vuex';

const base_url = "https://raw.githubusercontent.com/ku-leuven-msec/IoTBenchmark-Features/main/features.json"
const url = ref(base_url)
const store = useStore() as any
const opt = ref<{ text: string; value: string; }[]>([])
const show = ref(false)

function loadConfig(config: any) {
    opt.value = []
    let a = (config.features as any[]).filter(i => i.feature == "platform")
    for (let i = 0; i < a.length; i++) {
        opt.value.push({ text: a[i].description, value: a[i].name })
    }
}

loadConfig(store.state.config)

const fetchConfig = async () => {
    if (url.value == "") url.value = base_url
    const r = await fetch(url.value)
    store.commit("setConfiguration", await r.json())
    loadConfig(store.state.config)
}
const toggle = () => {
    show.value = !show.value
}
const arch = ref({ selected: 'x86' })
const nav = computed<String>(() => `/architecture/${arch.value.selected}/features`)

</script>
<template>
    <b-form-group>
        <h2>Architecture:</h2>
        <div class="d-flex justify-content-end">
            <a @click.prevent="toggle()" type="button">
                <i-bi-bookmark-plus @click.prevent="" style="pointer-events: all;" /></a>
        </div>
    </b-form-group>
    <b-form-group label="Enter location of features.json file" v-slot="{ ariaDescribedby }" v-if="show">
        <div class="row">
            <div class="col">

                <b-form-input class="form-control rounded" placeholder="Url to features.json file" v-model="url"
                    aria-label="URL" />
            </div>
            <div class="col"> <b-button @click="e => fetchConfig()">
                    <i-bi-download />
                </b-button>
            </div>
        </div>
    </b-form-group>
    <b-form-group label="Select your architecture:" v-slot="{ ariaDescribedby }">
        <b-form-radio-group id="arch" v-model="arch.selected" :options="opt" :aria-describedby="ariaDescribedby"
            name="arch-options"></b-form-radio-group>
    </b-form-group>
    <div>
        <RouterLink :to="{ name: 'features', params: { arch: arch.selected } }" v-slot="{ navigate }">
            <b-button @click="navigate">Confirm</b-button>
        </RouterLink>
    </div>
</template>
<style scoped></style>