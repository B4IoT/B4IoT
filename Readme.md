## The **B4IoT** framework
**B4IoT** is a framework to aid both IoT device developers and security tool developers.
By utilizing the **B4IoT** framework the user is able to generate a vulnerable image, runnable using Docker, the user has a choice of:
* Architecture the vulnerable image has to build on
* Weaknesses in configuration files that compromise the integrity of the image
* Vulnerabilities that, once exploited hinder the operations of the device
* Exploits that enable the attacker to elevate their privileges
* Keys that get leaked in the firmware
* Hardcoded credentials
* Weak ciphers 
* CVEs
* Breakable hashes
* Backdoors
* Weak IoT protocol integrations
* Memory vulnerabilities
* Weakly protected databases
* Exploitable webservers
* Many others!

Once selected the user is able to generate a Dockerfile which enable them to run an instance of their own custom vulnerable device.

### How to add features?
Included in this repo is a JSON Schema, using it you'll be able to define a new feature. The structure and logic of adding features to the image can be found in the **features**-folder.
If the feature you are adding mis dependent on a piece of software, it might be helpful to make the dependency a new feature as well, as to help further development of new features.
Another thing to note when building features is conflict and conflict resolution. If the feature you are building needs to have access to a specific port, set that port as an attribute in the JSON.



### Running a generated vulnerable image using Docker 

Run the following commands to create a dynamic instance of your Dockerfile (in a linux environment)

> docker build -t dvd:<"name"> 
>
> docker run --rm -d  dvd:<"name"> --name <"name">

### Connecting to the running container
> docker exec -it <"name"> bash

### Features repository
The features repository can be found [here](https://github.com/B4IoT/B4IoT-Features)


## Public Site
Visit the generator at: [https://b4iot.github.io/B4IoT](https://b4iot.github.io/B4IoT)
The web application is available by hosting the **_index.html_** file in the **_client/dist_**.
