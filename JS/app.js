const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const errorMsg = document.getElementById("errorMsg");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();

  if (!city) {
    errorMsg.classList.remove("hidden");
    return;
  }

  errorMsg.classList.add("hidden");
  console.log("Searching weather for:", city);
});

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});
