

const catalogSlider = document.createElement("div");
    catalogSlider.className = "catalog-slider";

    const previousButton = document.createElement("button");
    previousButton.className = "catalog-slider-button previous";
    previousButton.type = "button";
    previousButton.setAttribute("aria-label", `Filmes anteriores: ${category.title}`);
    previousButton.innerHTML = '<ion-icon name="arrow-back-outline"></ion-icon>';

    const nextButton = document.createElement("button");
    nextButton.className = "catalog-slider-button next";
    nextButton.type = "button";
    nextButton.setAttribute("aria-label", `Próximos filmes: ${category.title}`);
    nextButton.innerHTML = '<ion-icon name="arrow-forward-outline"></ion-icon>';

    const updateSliderButtons = () => {
        const hasOverflow = movieGrid.scrollWidth > movieGrid.clientWidth + 1;
        catalogSlider.classList.toggle("no-overflow", !hasOverflow);
        previousButton.disabled = movieGrid.scrollLeft <= 0;
            nextButton.disabled = !hasOverflow
                || movieGrid.scrollLeft + movieGrid.clientWidth >= movieGrid.scrollWidth - 1;
        };

        previousButton.addEventListener("click", () => {
            movieGrid.scrollBy({ left: -movieGrid.clientWidth, behavior: "smooth" });
        });
        nextButton.addEventListener("click", () => {
            movieGrid.scrollBy({ left: movieGrid.clientWidth, behavior: "smooth" });
        });
        movieGrid.addEventListener("scroll", updateSliderButtons);
        window.addEventListener("resize", updateSliderButtons);

        catalogSlider.append(previousButton, movieGrid, nextButton);
        catalogSection.append(categoryTitle, catalogSlider);
        movieCatalogs.append(catalogSection);
        updateSliderButtons();
sliderPrevious.addEventListener("click", () => {
    featuredSlider.scrollBy({ left: -featuredSlider.clientWidth, behavior: "smooth" });
});

sliderNext.addEventListener("click", () => {
    featuredSlider.scrollBy({ left: featuredSlider.clientWidth, behavior: "smooth" });
});
