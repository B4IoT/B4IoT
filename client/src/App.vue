<script  lang="ts">
import { RouterLink, RouterView } from 'vue-router'
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
  },
  computed:{
    isNotblank(){
      return this.$route.path==="/"
    }
  }
})
</script>

<template>
  <div class="layout">
  <div class="header">    
    <div class="image">
      <img class="KUL" src="/src/assets/KULeuven.png" alt="KU Leuven" >
    </div>
    <h1>Firmware Benchmark Generator</h1>

  </div>
  <div class="main">
          <div class="layout2 container my-5 p-0">
            <nav class="header2 navbar navbar-expand-lg navbar-light bg-light">
              <a class="navbar-brand" href="#">B4IoT</a>
              <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
              </button>

              <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav mr-auto">
                  <li class="nav-item active">
                  <RouterLink to="/B4IoT" class="nav-link">Home</RouterLink>
                </li>
                <li class="nav-item">
                  <RouterLink to="/architecture" class="nav-link">Generator</RouterLink>
                </li>
                </ul>
              </div>
            </nav>
            <div v-if="!isNotblank" class="main2 border p-3 m-1">
              <RouterView />
            </div>
            <div v-if="isNotblank" class="form-group">
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
          </div>
         
  </div> 






  <div class="footer"></div>
</div>

</template>

<style scoped>
.layout {
  height: 100vh;

  display: grid;
  grid:
    "header" auto
    "main" 1fr
    "footer" auto
    / 1fr;
  gap: 8px;
  grid-auto-flow: row dense;
}

.header { grid-area: header; }
.main { grid-area: main; }
.footer { grid-area: footer; }

.image{
  margin-left: 45%;
  width: 115px;
  height: 115px;
  line-height: 115px;
  text-align: center;
}
.KUL{
  max-width:100%;
  max-height:100%;
  vertical-align: middle;  
}

.layout2 {
  background-color: #fffa;
  padding: 10px 10px 10px 10px;
  min-height: 50vh;
  display: grid;
  grid:
    "header" auto
    "main" 1fr
    "footer" auto
    / 1fr;
  gap: 1px;
  grid-auto-flow: row dense;
}

.header2 { grid-area: header; }
.main2 { grid-area: main; }
.footer2 { grid-area: footer; }

.header h1{ 
  padding-top: 10px;
  text-align: center;
}



.navbar {
  padding-left: 1cap;
}

h1 {
  font-weight: 700;
  text-transform: capitalize;
  font-size: 42px;
  margin: 0px;
  color: #fff;
}

h2 {
  font-weight: 700;
  text-transform: capitalize;
  font-size: 21px;
  margin: 0px;
  color: #fff;
}

.menu {
  align-self: self-start;
}

</style>
