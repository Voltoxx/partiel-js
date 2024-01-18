// Partiel du 18 janvier 2024

// Tableaux pour stocker les recettes et les commandes
const commands = [];
const recipes = [];

// Fonction pour ajouter une nouvelle recette
function addRecipe() {
    const recipeNameInput = document.getElementById('newRecipeNameInput');
    const ingredientsCheckbox = document.querySelectorAll('#ingredientsCheckbox input[type="checkbox"]:checked');

    const newRecipeName = recipeNameInput.value;
    const newRecipeIngredients = Array.from(ingredientsCheckbox).map(checkbox => checkbox.value);

    if (newRecipeName && newRecipeIngredients.length > 0) {
        // Créer un nouvel objet recette
        const newRecipe = { name: newRecipeName, ingredients: newRecipeIngredients };
        // Ajouter la recette au tableau des recettes
        recipes.push(newRecipe);
        // Mettre à jour l'affichage des recettes
        renderRecipes();
        // Réinitialiser le champ de saisie du nom de la recette
        recipeNameInput.value = '';
        // Mettre à jour la liste déroulante des recettes dans les commandes
        updateRecipeSelect();
        // Décocher toutes les cases à cocher après l'ajout de la recette
        ingredientsCheckbox.forEach(checkbox => checkbox.checked = false);
    } else {
        console.error('Veuillez remplir tous les champs.');
    }
}

// Fonction pour afficher la liste des recettes
function renderRecipes() {
    const recipeUl = document.getElementById('recipeUl');
    recipeUl.innerHTML = recipes.map((recipe, index) => {
        return `<li>${recipe.name} - Ingrédients: ${recipe.ingredients.join(', ')}
                    <button class="btn btn-secondary" onclick="deleteRecipe(${index})">Supprimer</button>
                </li>`;
    }).join('');
}

// Fonction pour supprimer une recette
function deleteRecipe(index) {
    // Supprimer la recette du tableau des recettes
    recipes.splice(index, 1);
    // Mettre à jour la liste déroulante des recettes dans les commandes
    updateRecipeSelect();
    // Mettre à jour l'affichage des recettes
    renderRecipes();
}

// Fonction asynchrone pour lancer une nouvelle commande
async function launchCommand() {
    const recipeSelect = document.getElementById('recipeSelect');
    const sauceSelect = document.getElementById('sauceSelect');

    const selectedRecipeName = recipeSelect.value;
    const selectedSauce = sauceSelect.value;

    if (selectedRecipeName && selectedSauce) {
        try {
            // Obtenir l'heure actuelle depuis l'API
            const currentTime = await getCurrentTime();

            if (currentTime !== null) {
                // Trouver la recette sélectionnée dans le tableau des recettes
                const selectedRecipe = recipes.find(recipe => recipe.name === selectedRecipeName);

                if (selectedRecipe) {
                    // Créer un nouvel objet commande
                    const newCommand = {
                        recipe: { name: selectedRecipe.name, ingredients: selectedRecipe.ingredients },
                        sauce: selectedSauce,
                        time: currentTime,
                        timerElementId: `timer${commands.length}`,
                    };

                    // Ajouter la commande au tableau des commandes
                    commands.push(newCommand);
                    // Mettre à jour l'affichage des commandes
                    renderCommands();
                    // Démarrer les timers pour les commandes non validées
                    startTimers();
                    // Mettre à jour la liste déroulante des recettes dans les commandes
                    updateRecipeSelect();
                } else {
                    console.error('Erreur lors du lancement de la commande : recette non trouvée.');
                }
            } else {
                console.error('Erreur lors du lancement de la commande : heure actuelle non disponible.');
            }
        } catch (error) {
            console.error('Erreur lors du lancement de la commande :', error);
        }
    }
}

// Fonction pour mettre à jour la liste déroulante des recettes dans les commandes
function updateRecipeSelect() {
    const recipeSelect = document.getElementById('recipeSelect');
    recipeSelect.innerHTML = recipes.map(recipe => `<option value="${recipe.name}">${recipe.name}</option>`).join('');
}

// Fonction pour démarrer les timers pour les commandes non validées
function startTimers() {
    commands.forEach(command => {
        if (!command.status) {
            startTimer(command);
        }
    });
}

// Fonction pour afficher la liste des commandes en attente
function renderCommands() {
    const commandUl = document.getElementById('commandUl');
    commandUl.innerHTML = commands.map((command, index) => {
        if (!command.status) {
            const ingredientsList = command.recipe.ingredients.join(', ');
            const currentTime = new Date(command.time).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
            return `<li>${command.recipe.name} avec sauce ${command.sauce} - Ingrédients: ${ingredientsList} - ${currentTime} 
                        <span id="timer${index}"></span>
                        <button class="btn btn-secondary" onclick="validateCommand(${index})">Valider</button>
                    </li>`;
        } else {
            return '';
        }
    }).join('');

    // Démarrer les timers
    startTimers();
}

// Fonction asynchrone pour obtenir l'heure actuelle depuis l'API
async function getCurrentTime() {
    try {
        const response = await fetch('https://worldtimeapi.org/api/timezone/Europe/Paris');
        const data = await response.json();
        return data.unixtime * 1000; // Convertir le timestamp en millisecondes
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'heure actuelle :', error);
        return null;
    }
}

// Fonction pour démarrer le timer pour une commande spécifique
function startTimer(command) {
    const timerElement = document.getElementById(command.timerElementId);
    if (timerElement) {
        const startTime = new Date(command.time).getTime();

        // Fonction pour mettre à jour le timer
        function updateTimer() {
            const currentTime = new Date().getTime();
            const elapsedTime = currentTime - startTime;
            const minutes = Math.floor(elapsedTime / (1000 * 60));
            const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
            timerElement.textContent = `${String(minutes).padStart(2, '0')}m${String(seconds).padStart(2, '0')}s`;
            setTimeout(updateTimer, 1000);
        }

        // Démarrer le timer
        updateTimer();
    }
}

// Fonction pour afficher la liste des commandes validées
function renderValidatedCommands() {
    const validatedUl = document.getElementById('validatedUl');
    validatedUl.innerHTML = commands.map((command, index) => {
        if (command.status) {
            const ingredientsList = command.recipe.ingredients.join(', ');
            return `<li>${command.recipe.name} avec sauce ${command.sauce} - Ingrédients: ${ingredientsList} - Validée (${command.validatedTime})</li>`;
        } else {
            return '';
        }
    }).join('');
}

// Fonction pour valider une commande
function validateCommand(index) {
    if (index >= 0 && index < commands.length) {
        const validatedTime = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
        commands[index].status = true;
        commands[index].validatedTime = validatedTime;
        // Mettre à jour l'affichage des commandes
        renderCommands();
        // Mettre à jour l'affichage des commandes validées
        renderValidatedCommands();
        // Mettre à jour la liste déroulante des recettes dans les commandes
        updateRecipeSelect();
    }
}

// Afficher la liste des recettes au chargement de la page
renderRecipes();