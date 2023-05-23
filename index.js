document.addEventListener('DOMContentLoaded', async () => {
    //Création de mes variables
    let tabs = [];
    let pokemons = [];
    let allPokemon = [];
    let typeSelected = '';
    let nameEnter = '';
    let idPokemonSelected = 1;
    let loading = true;

    //Récupération de mes Élement DOM
    const inputName = document.getElementById('name')
    const types = document.getElementById('type')
    const generationChoose = document.getElementById('generation-choose')
    const tabRegister = document.getElementsByClassName("tab-registers")[0];
    const tabBodies = document.getElementsByClassName("tab-bodies")[0];
    const typePokemon = document.getElementById('types-pokemons')
    const abilities = document.getElementById('abilities')
    const height = document.getElementById('height')
    const weight = document.getElementById('weight')
    const category = document.getElementById('category')
    const weaknesses = document.getElementById('weaknesses')
    const currentImg = document.getElementById('current-img')
    const previousImg = document.getElementById('previous-img')
    const nextImg = document.getElementById('next-img')
    const namePokemonSelected = document.getElementById('name-pokemon-selected')

    //Event pour savoir quand la valeur de mon input change
    inputName.addEventListener('input', (e) => {
        tabBodies.innerHTML = '';
        nameEnter = e.target.value;
        checkFilter();
    })

    //Event pour savoir quand ma valeur de mon select change
    types.addEventListener('change', (e) => {
        tabBodies.innerHTML = '';
        typeSelected = types.value;
        checkFilter()
    })

    document.addEventListener('keydown', (event) => {
        if(event.key == "ArrowRight"){
            if (idPokemonSelected == allPokemon.sort(compareNumbers).slice(-1)[0].id){
                idPokemonSelected = 1;
            }else{
                idPokemonSelected++;
            }
            setTrioPokemon(idPokemonSelected);
        }else if (event.key == "ArrowLeft"){
            idPokemonSelected--;
            if (idPokemonSelected <= 0){
                idPokemonSelected = allPokemon.slice(-1)[0].id
                console.log(idPokemonSelected)
            }
            setTrioPokemon(idPokemonSelected);
        }
    })
    //Mes appelles à l ' API
    await fetch('https://pokeapi.co/api/v2/generation', 'GET', fetchGeneration);
    await fetch('https://pokeapi.co/api/v2/type/', 'GET', fetchType);
    fetch('https://pokeapi.co/api/v2/pokemon/?limit=3000', 'GET',setAllPokemon);

    //Récupere tous les pokémons et fait une boucle dessus pour mon slider a droite
    function setAllPokemon(){
        allPokemon = [];
        let poke;
        let response = JSON.parse(this.response)
        response.results.map((pok, index) => {
            fetch(pok.url, 'GET', (e) => {
                poke = JSON.parse(e.originalTarget.response)
                allPokemon.push(poke)
            })
        })
    }

    //Fonction de vérification si dans mon tableau il y a un pokemon correspondant a mes deux champs select et input
    function checkFilter(){
        pokemons.sort(compareNumbers);
        pokemons.map((pok) => {
            if (typeSelected != ''){
                pok.types.map((type, index) => {
                    if ((pok.name.includes(nameEnter) || pok.id == Number(nameEnter)) && type.type.name == typeSelected) {
                        htmlInCard(pok);
                    }
                })
            }else{
                if (pok.name.includes(nameEnter) || pok.id == Number(nameEnter) ){
                    htmlInCard(pok);
                }
            }
        })
    }

    //Fonction permettant de trier mon tableau avec le sort au dessus en ordre croissant
    function compareNumbers(a, b) {
        return a - b;
    }

    //Fonction fetch personnalisé afin de faire des appelles a l'api sans dupliquer le code
    function fetch(url, method, func) {
        let request = new XMLHttpRequest()
        request.addEventListener("load", func);
        request.open(method, url);
        request.send()
    }

    //Permet d'ajouter tout mes types récupérer via l'API dans mon select
    function fetchType(){
        let response = JSON.parse(this.response);
        response.results.map((type, i) => {
            let option = document.createElement('option')
            option.value = type.name
            option.innerText = type.name
            types.append(option)
        })

    }

    //Permet de récupérer toutes les génération de l'API pour les metter dans mon système d'onglets
    function fetchGeneration() {
        let response = JSON.parse(this.response);
        response.results.map((gen, i) => {
            let button = document.createElement('button')
            //Récupération de la génération en francais
            fetch(gen.url, 'GET', (e) => {
                let res = JSON.parse(e.originalTarget.response).names;
                button.innerText = res[3].name;
            })
            //Si i = 0 alors on fait un traitements specifiques
            if (i == 0) {
                generationChoose.innerText = "Génération I"
                tabBodies.innerHTML = '';
                button.className = "active-tab";
                fetch(gen.url, 'GET', printPokemonByGen)
            }
            tabRegister.append(button)
            button.addEventListener('click', (e) => {
                tabBodies.innerHTML = '';
                generationChoose.innerText = e.target.innerHTML;
                //Suppressions de toute les classe de tout mes élement dans tabs
                for (let b in tabs) {
                    tabs[b].className = '';
                }
                //Ajpout de la class sur mon element actuelle
                e.target.className = 'active-tab';
                fetch(gen.url, 'GET', printPokemonByGen)
            })
        })
        tabs = tabRegister.children;
    }

    //Récupere les pokemons par la génération selectionné
    function printPokemonByGen() {
        let res = JSON.parse(this.response);
        let pokemons1 = res.pokemon_species;
        pokemons1.map((pokemon, index) => {
            fetch(pokemon.url, 'GET', (e) => {
                let pokeResponse = JSON.parse(e.originalTarget.response);
                addCardPokemon(pokeResponse)
            })
        })
    }

    //Fonctionnalité pour ajouter tout mes pokemons dans ma variable pokemon (array) et ajouter le html
    function addCardPokemon(pokeResponse){
        pokemons = [];
        fetch(pokeResponse.varieties[0].pokemon.url, 'GET',(event) => {
            let currentPokemon = JSON.parse(event.originalTarget.response)
            pokemons.push(currentPokemon);
            htmlInCard(currentPokemon)
        })
    }

    //Fonctionnalité afin d'ajouter mon contenue grace au DOM
    function htmlInCard(currentPokemon){
        let div = document.createElement("div")
        let h1 = document.createElement("h1")
        let img = document.createElement("img");
        let p = document.createElement("p");
        img.src = currentPokemon.sprites.front_default;
        h1.className = "pokemon-name-card";
        h1.innerText = currentPokemon.name;
        p.innerText = "#" + currentPokemon.id;
        div.className = 'poke-card';
        div.append(img)
        div.append(p)
        div.append(h1)

        div.addEventListener(('click'), () => setTrioPokemon(currentPokemon.id))
        tabBodies.append(div);
    }

    function setTrioPokemon( pokemonIDSelected){
        let previousPokemon;
        let nextPokemon;
        let selectedPokemon;
        if (pokemonIDSelected == 1 || idPokemonSelected < 0){
            previousPokemon = allPokemon.slice(-1)[0]
        }else{
            previousPokemon = allPokemon.find(element => (element.id == pokemonIDSelected - 1))
        }

        if (allPokemon.find(element => element.id == (pokemonIDSelected + 1)) == undefined){
            nextPokemon = allPokemon[0]
        }else{
            nextPokemon = allPokemon.find(element => element.id == (pokemonIDSelected+ 1))
        }
        selectedPokemon = allPokemon.find(element => element.id == pokemonIDSelected);
        printNextPokemon(nextPokemon)
        printPokemonSelected(selectedPokemon)
        printPreviousPokemon(previousPokemon)
    }
    function printPokemonSelected(selectedPokemon){
        let typesP = [];
        typePokemon.innerHTML = ''
        abilities.innerHTML = ''
        weaknesses.innerHTML = ''
        selectedPokemon.types.map((type, index) => {
            let li = document.createElement('li');
            li.className = type.type.name;
            li.innerText = type.type.name;
            typePokemon.append(li)
            fetch(type.type.url, 'GET', (e) => {
                let res = JSON.parse(e.originalTarget.response)
                res.damage_relations.double_damage_from.map((weakness, index) => {
                    let li = document.createElement('li');
                    li.className = weakness.name;
                    li.id = index
                    li.innerText = weakness.name;
                    weaknesses.append(li)
                })
            })
        })
        height.innerText = selectedPokemon.height
        weight.innerText = selectedPokemon.weight
        selectedPokemon.abilities.map((ability, index) => {
            let li = document.createElement('li');
            li.innerText = ability.ability.name;
            abilities.append(li)
        })
        currentImg.src = selectedPokemon.sprites.front_default
        idPokemonSelected = selectedPokemon.id;
        namePokemonSelected.innerText = selectedPokemon.name + ' #' + selectedPokemon.id
    }

    function printPreviousPokemon(previousPokemon){
        previousImg.src = previousPokemon.sprites.front_default
    }

    function printNextPokemon(nextPokemon){
        nextImg.src = nextPokemon.sprites.front_default
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
})