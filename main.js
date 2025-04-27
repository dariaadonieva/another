const sheets = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTT7L6dX32akwFZ8qotlUkk2X2a6LSYj-V6gFHi1uVe7fBZ7xKhFeEAdQsjTBjwFYk34LdPuF5rI3Hc/pub?output=csv";
const response = await fetch(sheets);
const csvText = await response.text();

const sanitizeName = (name) => {
  const accentsMap = new Map([ ['á', 'a'], ['à', 'a'], ['â', 'a'], ['ä', 'a'], ['ã', 'a'], ['å', 'a'], ['é', 'e'], ['è', 'e'], ['ê', 'e'], ['ë', 'e'], ['í', 'i'], ['ì', 'i'], ['î', 'i'], ['ï', 'i'], ['ó', 'o'], ['ò', 'o'], ['ô', 'o'], ['ö', 'o'], ['õ', 'o'], ['ø', 'o'], ['ú', 'u'], ['ù', 'u'], ['û', 'u'], ['ü', 'u'], ['ý', 'y'], ['ÿ', 'y'], ['ñ', 'n'], ['ç', 'c'] ]);
  let sanitized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  sanitized = Array.from(sanitized).map(char => accentsMap.get(char) || char).join('');
  return sanitized.replace(/[^A-Za-z0-9_\-]/g, '_');
};


/**
 * Convertit une chaîne CSV en objet JSON en utilisant ES6
 * @param {string} csvString - La chaîne CSV à convertir
 * @returns {Array} - Tableau d'objets représentant les données CSV
 */
const csvToJson = (csvString) => {
  try {
    const lines = [];
    let currentLine = '';
    let insideQuotes = false;
    
    for (let i = 0; i < csvString.length; i++) {
      const char = csvString[i];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
        currentLine += char;
      } else if (char === '\n' && !insideQuotes) {
        lines.push(currentLine);
        currentLine = '';
      } else {
        currentLine += char;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    const headers = lines[0].split(',').map(header => header.trim());
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const values = [];
      let currentValue = '';
      let inQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      values.push(currentValue);
      
      const obj = {};
      headers.forEach((header, index) => {
        let value = values[index] || '';
        
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        value = value.replace(/\r/g, '');

        if (value.includes('\n')) {
          value = value.split('\n').map(line => `<p>${line.trim()}</p>`).join('');
        }
        
        obj[header] = value;
      });
      
      result.push(obj);
    }
    
    return result;
  } catch (error) {
    console.error("Erreur lors de la conversion CSV en JSON:", error);
    return [];
  }
};




const bgColors = ["red", "blue","gray","green","yellow","purple","orange","pink","brown","black","white"];

const json = csvToJson(csvText);
console.log(json);

const $projets = document.querySelector(".projets");
$projets.querySelectorAll("div").forEach(div => {
  div.style.backgroundColor = "transparent";
});

const specificColors = ["transparent"]; // Specify the colors you want

// Clear the .projets container before adding new projects
$projets.innerHTML = "";

// Filter the JSON data to include only valid and clickable projects
const clickableProjects = json.filter(item => item.titre && item.description); // Adjust the condition as needed

// Loop through the filtered JSON data
clickableProjects.forEach((item) => {
  const div = document.createElement("div");
  $projets.appendChild(div);

  // Set random background color for the div
  gsap.set(div, { backgroundColor: e => gsap.utils.random(specificColors) });

  // Animate the div on creation
  gsap.from(div, {
    x: e => gsap.utils.random(-1000, 1000),
    y: e => gsap.utils.random(-1000, -20),
    opacity: 0,
    duration: 0.5
  });

  // Add the project image
  const img = document.createElement("img");
  img.src = `img/${sanitizeName(item.titre)}.png`;
  div.appendChild(img);

  // Add the project title
  const titre = document.createElement("h1");
  titre.textContent = item.titre;
  div.appendChild(titre);

  // Add the project categories
  const categories = document.createElement("div");
  categories.textContent = item.catégories;
  div.appendChild(categories);

  // Add the project description
  const description = document.createElement("p");
  description.textContent = item.description;
  div.appendChild(description);

  // Add click event for the project
  div.addEventListener("click", () => {
    const header = document.querySelector("header");
    header.classList.add("fixed");

    const projets = document.querySelector(".projets");
    projets.classList.add("fixed");

    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    document.body.appendChild(overlay);

    const wrap = document.createElement("div");
    wrap.classList.add("wrap");
    overlay.appendChild(wrap);

    const fiche = document.createElement("div");
    fiche.classList.add("fiche");
    wrap.appendChild(fiche);

    const close = document.createElement("div");
    close.textContent = "×";
    close.classList.add("close");
    overlay.appendChild(close);

    close.addEventListener("click", () => {
      gsap.to(overlay, { opacity: 0, duration: 1, onComplete: () => overlay.remove() });
      header.classList.remove("fixed");
      projets.classList.remove("fixed");
    });

    const img = document.createElement("img");
    img.src = `img/${sanitizeName(item.titre)}.png`;
    fiche.appendChild(img);

    const titre = document.createElement("h1");
    titre.textContent = item.titre;
    fiche.appendChild(titre);

    const desc = document.createElement("div");
    desc.innerHTML = item.modale || item.description || ""; // Use `modale` or `description` if available
    fiche.appendChild(desc);

    if (item.images && item.images.trim() !== "") {
      const images = item.images.split(",");
      const gallery = document.createElement("div");
      gallery.classList.add("gallery");
      images.forEach((image) => {
        const img = document.createElement("img");
        const name = sanitizeName(item.titre);
        img.src = `img/${name}/${image.trim()}`;
        gallery.appendChild(img);
      });
      fiche.appendChild(gallery);
    }

    if (item.videos && item.videos.trim() !== "") {
      const videos = item.videos.split(",");
      const videoGallery = document.createElement("div");
      videoGallery.classList.add("video-gallery");
      videos.forEach((video) => {
        const videoElement = document.createElement("video");
        videoElement.src = `videos/${sanitizeName(item.titre)}/${video.trim()}`;
        videoElement.controls = true;
        videoGallery.appendChild(videoElement);
      });
      fiche.appendChild(videoGallery);
    }

    gsap.from(overlay, { opacity: 0, duration: 0.4 });
  });
});

   
// Function to animate images randomly
const animateImagesRandomly = (img) => {
  const randomAnimation = () => {
    gsap.to(img, {
      width: () => gsap.utils.random(200, 600) + "px", // Random width between 200px and 600px
      height: () => gsap.utils.random(200, 600) + "px", // Random height between 200px and 600px
      borderRadius: () => gsap.utils.random(0, 50) + "%", // Random border radius
      duration: 2, // Duration of each animation
      ease: "power1.inOut",
      onComplete: randomAnimation, // Call the function again to continue the animation
    });
  };
  randomAnimation();
};


// Stop and reset animation on hover over the .projets container
$projets.addEventListener("mouseenter", () => {
  gsap.killTweensOf("img"); // Stop all animations on images
  $projets.querySelectorAll("img").forEach((img) => {
    gsap.to(img, {
      width: "200px", // Reset to original size
      height: "200px", // Reset to original size
      borderRadius: "50%", // Reset to circle
      duration: 0.4,
      ease: "power2.inOut",
    });
  });
});

$projets.addEventListener("mouseleave", () => {
  $projets.querySelectorAll("img").forEach((img) => {
    animateImagesRandomly(img); // Resume random animation
  });
});



// Filter the JSON data if needed (optional)
// Removed duplicate declaration of clickableProjects






