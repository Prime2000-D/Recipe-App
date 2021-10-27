//Selector
const meals = document.getElementById('meals')
const mealList = document.getElementById('meal-list')
const searchBtn = document.querySelector('.search-btn')
const searchBar = document.querySelector('.search-bar')
const searchInput = document.querySelector('.search-bar input')
const closebtn = document.querySelector('.close-btn')
const food = document.querySelector('.food')
const recipeContainer = document.querySelector('.recipe-detail-container')


//Event handler
function getFocus(){
    setTimeout( () => {
        searchInput.focus()
    }, 10)
}

//Event Listener

//Show search box
searchBtn.addEventListener('click',() => {
   searchBar.classList.toggle("hidden")
})

//Search recipe
searchInput.addEventListener('keyup', (event) => {
    if(searchInput.value !== ''){
        if(event.keyCode === 13){
            fetechSearchedMeal(searchInput.value) 
        }
    }  
},true)

//remove the item from the favourite
mealList.addEventListener('click', async (e) =>{
    close(e, 'close-btn')
    let item = e.target
    if(item.classList[0] === 'close-btn'){
        const meal = item.parentElement.lastElementChild.getAttribute('value')
        const regEx = /[^0-9]/
        if(!regEx.exec(meal)){
            const mealData = await getMealById(meal)
            removeMealLS(mealData.idMeal)
        }
    }
})

//Show the procedure of making recipe
mealList.addEventListener('click', async (e) => {
    let item = e.target
    if(item.classList[0] === 'food-img' || item.classList[0] === 'food-name'){
        const meal = item.parentElement.lastElementChild.getAttribute('value')
        const regEx = /[^0-9]/
        if(!regEx.exec(meal)){
            const mealData = await getMealById(meal)
            getRecipeDetail(mealData)
        }
        else{
            fetechSearchedMeal(meal) 
        }
            
    }
})



//Called Function
getRandomMeal();


//Async Function
async function getRandomMeal(){
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php')
    const respData = await resp.json();
    const randomMeal = respData.meals[0];
    addRandomMeal(randomMeal, true)
} 

async function getMealById(id) {
    const resp = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    const respData = await resp.json()
    return respData.meals[0] 
}

async function getMealBySearch(name) {
    const resp = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`)
    const respData = await resp.json()
    return respData.meals
}

async function fetchFavMeal(){
    if(!emptyFavList()){
        const meal = document.createElement('div')
        meal.classList.add('.food')
        const mealIds = getMealLS()
        for (let i = 0; i < mealIds.length; i++) {
            const mealId = mealIds[i];
            const mealData = await getMealById(mealId)
            addFavMeal(mealData)   
        }
    }
    else{
        mealList.innerHTML = "<div class='empty-list' >Your favourite recipe list is empty. Find your delicious recipe and add it on your favourite.</div>"
    }
}

async function fetechSearchedMeal(mealName){
    //remove the previous search
    let mealChild = meals.childNodes
    if(mealChild.length !== 2){
        do {
            mealChild[2].parentNode.removeChild(mealChild[2])
        } while (mealChild.length !== 2);
    }
    //show the random meal searched for
    const allMeals = await getMealBySearch(mealName);
    for (const meal of allMeals) {
        addRandomMeal(meal)
    }
}


//Function
function addRandomMeal(mealData, random = false){
    const meal = document.createElement('div')
    meal.classList.add('recipe')
    meal.innerHTML = `
        <div class="fav-food">
            ${
                random ? '<div class="tag">Recipe of the Day</div>' : ''
            }
            <img src="${mealData.strMealThumb}" alt="" class="fav-food-img">
                <div class="meal-body">
                    <div class="fav-food-name">${mealData.strMeal}</div>
                    <button class="fav-btn">❤</button>
                </div>  
            </div>
    `
    const favBtn = meal.querySelector('.fav-btn')
    favBtn.addEventListener('click', () => {
        if(!favBtn.classList.contains('active')){
            favBtn.classList.add('active')
            addMealLS(mealData.idMeal)
        }
        else{
            favBtn.classList.remove('active')
            removeMealLS(mealData.idMeal)
        }

        mealList.innerHTML = ``
        fetchFavMeal();
    })
    meals.appendChild(meal)
}

function addMealLS(mealId){
    const mealIds = getMealLS(mealId);
    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId ]))
}
function removeMealLS(mealId){
    const mealIds = getMealLS();
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter((id) => id !== mealId)))
}
function getMealLS() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'))
    return mealIds === null ? [] : mealIds;
}

function emptyFavList(){
    const localSto = JSON.parse(localStorage.getItem('mealIds'))
    if(localSto.length === 0)
        return true
    return false
}

function addFavMeal(mealData){
    const favMeal = document.createElement('div')
    favMeal.innerHTML = `
        <div class="food">
            <button class="close-btn">⨯</button>
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}" class="food-img">
            <div class="food-name">${mealData.strMeal}</div>
        </div>`
    mealList.appendChild(favMeal)
    
    const foodName = favMeal.querySelectorAll(".food-name")
    for (let i = 0; i < foodName.length; i++) {
        const node = foodName[i];
        foodName[i].setAttribute('value', mealData.idMeal)
        let strArr = node.innerText.split(" ")
        if(strArr.length > 2){
            node.innerText = strArr[0]+' '+strArr[1]+'...'
        }
    }      
}

function close(event,clsName) {
    const item = event.target
    if(item.classList[0] === clsName){
        const parentItem = item.parentElement
        parentItem.remove()
    }
}

function getRecipeDetail(mealData){
    recipeContainer.style.setProperty('display','block')
    recipeContainer.innerHTML=`
    <div class="recipe-detail">
        <button class="detail-close-btn">⨯</button>
        <h3 class="food-title">${mealData.strMeal}</h2>
        <img src="${mealData.strMealThumb}" alt="" class="recipe-img">
        <div class="recipe-instruction">
            <div class="instruction">
                <div class="ingredients">
                    <h3>Ingredients</h3>
                    <ul>
                        
                    </ul>
                </div>
                <h3>Instruction</h3>
                <p>
                    ${mealData.strInstructions}
                </p>
            </div>
        </div>
    </div>
    `
    const detailCloseBtn =  recipeContainer.querySelector(".detail-close-btn")
    detailCloseBtn.addEventListener('click', (e) => {
        close(e, 'detail-close-btn')
        recipeContainer.style.setProperty('display','none')
    })

    const ulEl = recipeContainer.querySelector('ul')
    for (const key in mealData) {
        for (let i = 0; i <= 20; i++) {
            const liEl = document.createElement('li')
            let strIngredient = 'strIngredient' + i
            if (key === strIngredient && mealData[strIngredient] !== "") {
                liEl.innerText = mealData[strIngredient]
                ulEl.append(liEl)
            }
        }
    }

}





