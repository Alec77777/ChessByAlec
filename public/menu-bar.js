const menuBars = document.querySelectorAll(".menu-bar");

if (menuBars.length !== 0) {
  document.documentElement.style.setProperty(
    "--menu-bar-width",
    getComputedStyle(menuBars[0]).width
  );

  menuBars.forEach((menuBar) => {
    menuBar.addEventListener("click", () => {
      menuBar.classList.toggle("open");
      if (!menuBar.classList.contains("open")) {
        gameInfo.style.width = getComputedStyle(menuBar).width;
        gameInfo.style.height = getComputedStyle(menuBar).height;
      } else {
        gameInfo.style.width = "220px";
        gameInfo.style.height = "400px";
      }
    });
  });
}
