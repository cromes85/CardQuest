document.addEventListener("DOMContentLoaded", function () {
  const pokeball = document.querySelector(".pokeball");
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("usernameInput");
  const passwordInput = document.getElementById("passwordInput");
  const dashboard = document.getElementById("dashboard");
  const greetings = document.getElementById("greetings");
  const cardsContainer = document.getElementById("cardsContainer");
  const logoutButton = document.getElementById("logoutButton");

  let currentUser = null;

  // Charger les fichiers JSON externes via fetch()
  const cardsPromise = fetch("data/cards.json").then((response) =>
    response.json()
  );
  const clientsPromise = fetch("data/clients.json").then((response) =>
    response.json()
  );
  const usersPromise = fetch("data/users.json").then((response) =>
    response.json()
  );

  // Cacher le dashboard et le bouton de déconnexion par défaut
  dashboard.style.display = "none";
  logoutButton.style.display = "none";

  // Gérer la connexion
  document.getElementById("loginButton").addEventListener("click", function () {
    const username = usernameInput.value;
    const password = passwordInput.value;

    usersPromise
      .then((usersData) => {
        const user = usersData.find(
          (user) => user.username === username && user.password === password
        );
        if (user) {
          currentUser = user;

          // Ouvrir la pokeball en ajoutant la classe "open"
          pokeball.classList.add("open");

          // Masquer le formulaire de connexion
          loginForm.style.display = "none";

          // Afficher le tableau de bord après un court délai
          setTimeout(function () {
            dashboard.style.display = "block";
            if (currentUser.type === "gestion") {
              displayGestionDashboard();
            } else {
              displayClientDashboard();
            }
            // Afficher le bouton de déconnexion
            logoutButton.style.display = "block";
          }, 500); // Ajoutez un délai de 500 ms pour l'animation de la pokeball
        } else {
          alert("Nom d'utilisateur ou mot de passe incorrect !");
        }
      })
      .catch((error) =>
        console.error("Erreur lors du chargement du fichier users.json:", error)
      );
  });

  // Gérer la déconnexion
  document
    .getElementById("logoutButton")
    .addEventListener("click", function () {
      // Réinitialiser les valeurs et afficher à nouveau le formulaire de connexion
      currentUser = null;
      loginForm.style.display = "block";
      dashboard.style.display = "none";
      logoutButton.style.display = "none";

      // Supprimer les cartes affichées dans le tableau de bord
      cardsContainer.innerHTML = "";

      // Réinitialiser les champs de saisie du formulaire de connexion
      usernameInput.value = "";
      passwordInput.value = "";

      // Fermer la pokeball en retirant la classe "open"
      pokeball.classList.remove("open");
    });

  function displayGestionDashboard() {
    greetings.textContent = `Bonjour, gestionnaire ${currentUser.username} ! Voici les clients et leurs cartes :`;

    Promise.all([cardsPromise, clientsPromise])
      .then(([cardsData, clientsData]) => {
        clientsData.forEach((client) => {
          const clientElement = document.createElement("div");
          clientElement.classList.add("client");

          const nameElement = document.createElement("h2");
          nameElement.textContent = `Client: ${client.name} (ID: ${client.client_id})`;
          clientElement.appendChild(nameElement);

          const clientCards = cardsData.filter((card) =>
            client.cards.includes(card.id)
          );

          clientCards.forEach((card) => {
            const cardElement = createCardElement(card);
            clientElement.appendChild(cardElement);
          });

          cardsContainer.appendChild(clientElement);
        });
      })
      .catch((error) =>
        console.error("Erreur lors du chargement des JSON:", error)
      );
  }

  function displayClientDashboard() {
    greetings.textContent = `Bonjour, cher client ${currentUser.username} ! Voici vos cartes :`;

    cardsPromise
      .then((cardsData) => {
        currentUser.cards.forEach((cardId) => {
          const card = cardsData.find((card) => card.id === cardId);
          if (card) {
            const cardElement = createCardElement(card);
            cardsContainer.appendChild(cardElement);
          }
        });
      })
      .catch((error) =>
        console.error("Erreur lors du chargement du fichier cards.json:", error)
      );
  }

  function createCardElement(card) {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");

    const imgElement = document.createElement("img");
    imgElement.src = card.image;
    cardElement.appendChild(imgElement);

    const nameElement = document.createElement("h2");
    nameElement.textContent = card.name;
    cardElement.appendChild(nameElement);

    const valueAtPurchaseElement = document.createElement("p");
    valueAtPurchaseElement.textContent = `Valeur à l'achat: €${card.value_at_purchase}`;
    cardElement.appendChild(valueAtPurchaseElement);

    const currentValueElement = document.createElement("p");
    currentValueElement.textContent = `Valeur actuelle: €${card.current_value}`;
    cardElement.appendChild(currentValueElement);

    return cardElement;
  }
});
