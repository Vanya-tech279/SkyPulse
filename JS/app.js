const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();

  if (!city) {
    console.log("City name is required");
    return;
  }

  console.log("Searching weather for:", city);
});

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});
