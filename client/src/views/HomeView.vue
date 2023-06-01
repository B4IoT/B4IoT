<template>
    <div class="form-group">
        <vue-markdown :source="src"></vue-markdown>


    <h4>Other information about B4IoT</h4>
    
    
    <a href="https://github.com/ku-leuven-msec/IoTBenchmark-Features"> Add new Features to the Features repository </a>
    <br />
    <a href="https://github.com/B4IoT/B4IoT">Inspect the source code of this Generator</a>

    <br />
    <h3>Cite this work</h3>
    <p>
      @inproceedings{deruck_B4IoT_23, <br />
        &emsp;author    = {Dairo de Ruck and Victor Goeman and Michiel Willocx and Jorn Lapon and Vincent Naessens}, <br />
        &emsp;booktitle = {The 18th International Conference on Availability, Reliability and Security (ARES 2023)},<br />
        &emsp;month     = {Aug},<br />
        &emsp;title     = {Linux-based IoT Benchmark Generator For Firmware Security Analysis Tools},<br />
        &emsp;year      = {2023}<br />
    }
    </p>
    </div>
    

</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import VueMarkdown from 'vue-markdown-render'

export default defineComponent({
  name: 'MyComponent',
  components: {
    VueMarkdown
  },
  setup(props, ctx) {
    const src = ref('## The **B4IoT** framework \n **B4IoT** is a framework to aid both IoT device developers and security tool developers.\n By utilizing the **B4IoT** framework the user is able to generate a vulnerable image, runnable using Docker, the user has a choice of:\n * Architecture the vulnerable image has to build on\n * Weaknesses in configuration files that compromise the integrity of the image\n * Vulnerabilities that, once exploited hinder the operations of the device\n * Exploits that enable the attacker to elevate their privileges\n * Keys that get leaked in the firmware\n * Hardcoded credentials\n * Weak ciphers \n * CVEs\n * Breakable hashes\n * Backdoors\n * Weak IoT protocol integrations\n * Memory vulnerabilities\n * Weakly protected databases\n * Exploitable webservers\n * Many others!\n \n Once selected the user is able to generate a Dockerfile which enable them to run an insance of their own custom vulnerable device.\n \n ### How to add features?\n Included in this repo is a JSON Schema, using it you will be able to define a new feature. The structure and logic of adding features to the image can be found in the **features**-folder\n \n ### Running a generated vulnerable image using Docker \n \n Run the following commands to create a dynamic instance of your Dockerfile (in a linux enviroment)\n > docker build -t dvd:<"name"> \n >\n > docker run --name <"name"> --rm -d  dvd:<"name"> \n > \n > docker exec -it <"name"> bash\n ')

    return {
      src
    }
  }
})
</script>