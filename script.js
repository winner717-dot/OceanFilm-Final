const apiKey = "68f19163becdd90a03e3da971aa5825c";
const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const results = document.getElementById("results");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = input.value.trim();
  if (!query) return;

  results.innerHTML = "<p>Caricamento...</p>";

  try {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (!data.results.length) {
      results.innerHTML = "<p>Nessun risultato trovato.</p>";
      return;
    }

    results.innerHTML = data.results.slice(0, 10).map(movie => `
      <div class="movie">
        <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}" />
        <div class="info">
          <h3>${movie.title} (${(movie.release_date || "").slice(0, 4)})</h3>
          <a href="film.html?tmdb=${movie.id}">🎬 Guarda ora</a>
        </div>
      </div>
    `).join("");
  } catch (err) {
    results.innerHTML = "<p>Errore durante la ricerca.</p>";
  }
});
