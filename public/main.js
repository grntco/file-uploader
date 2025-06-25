function initEvents() {
  const addFileBtn = document.getElementById("add-file-btn");

  addFileBtn.addEventListener("click", () => {
    const uploadForm = document.getElementById("upload-form");
    console.log("clicked");

    uploadForm.classList.remove("hidden");
  });
}

initEvents();
